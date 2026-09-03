#!/usr/bin/env node
/**
 * CURSOR-395: Fix Twilio TFV rejection 30482 (business email must use official domain).
 * Loads secrets from sites/.env — never logs tokens or full emails beyond domain.
 *
 * Usage: node scripts/fix-twilio-tfv.js
 */
import "dotenv/config";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tfvSid = process.env.TWILIO_TFV_SID;
const newEmail = process.env.NEW_BUSINESS_EMAIL;
const oldEmail = (process.env.OLD_BUSINESS_EMAIL || "").toLowerCase();

function redactEmail(email) {
  if (!email || typeof email !== "string") return "(none)";
  const at = email.indexOf("@");
  if (at < 0) return "(invalid)";
  return `***@${email.slice(at + 1)}`;
}

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing ${name} in .env`);
    process.exit(1);
  }
}

requireEnv("TWILIO_ACCOUNT_SID", accountSid);
requireEnv("TWILIO_TFV_SID", tfvSid);
requireEnv("NEW_BUSINESS_EMAIL", newEmail);

let client;
if (apiKeySid && apiKeySecret) {
  client = twilio(apiKeySid, apiKeySecret, { accountSid });
  console.log("Auth: API Key SID (secret not printed)");
} else if (authToken) {
  client = twilio(accountSid, authToken);
  console.log("Auth: Account Auth Token (not printed)");
} else {
  console.error("Need TWILIO_API_KEY_SID+TWILIO_API_KEY_SECRET or TWILIO_AUTH_TOKEN");
  process.exit(1);
}

async function fetchTfv() {
  return client.messaging.v1.tollfreeVerifications(tfvSid).fetch();
}

async function updateTrustHubEmails(customerProfileSid) {
  if (!customerProfileSid) {
    console.log("No customer_profile_sid on TFV — skipping Trust Hub End User update");
    return { updated: [] };
  }

  console.log(`Customer profile: ${customerProfileSid}`);

  // Update Customer Profile email field if present
  try {
    const profile = await client.trusthub.v1.customerProfiles(customerProfileSid).fetch();
    console.log(
      `Profile email before: ${redactEmail(profile.email)} status=${profile.status}`,
    );
    if (profile.email && profile.email.toLowerCase() !== newEmail.toLowerCase()) {
      await client.trusthub.v1.customerProfiles(customerProfileSid).update({
        email: newEmail,
      });
      console.log(`Profile email updated → ${redactEmail(newEmail)}`);
    }
  } catch (e) {
    console.warn(`Customer profile email update skipped: ${e.message}`);
  }

  // Entity assignments → End Users with email-like attributes
  const updated = [];
  const assignments = await client.trusthub.v1
    .customerProfiles(customerProfileSid)
    .customerProfilesEntityAssignments.list({ limit: 50 });

  for (const a of assignments) {
    const objectSid = a.objectSid;
    if (!objectSid || !objectSid.startsWith("IT")) continue;

    let endUser;
    try {
      endUser = await client.trusthub.v1.endUsers(objectSid).fetch();
    } catch {
      continue;
    }

    const attrs = { ...(endUser.attributes || {}) };
    const emailKeys = Object.keys(attrs).filter((k) =>
      /email/i.test(k),
    );
    if (emailKeys.length === 0 && typeof attrs.email === "string") {
      emailKeys.push("email");
    }

    let dirty = false;
    for (const key of emailKeys.length ? emailKeys : ["email"]) {
      const current = attrs[key];
      if (typeof current !== "string") continue;
      const lower = current.toLowerCase();
      if (
        lower === oldEmail ||
        lower.endsWith("@gmail.com") ||
        (oldEmail && lower === oldEmail)
      ) {
        attrs[key] = newEmail;
        dirty = true;
        console.log(
          `EndUser ${objectSid} type=${endUser.type} attr.${key}: ${redactEmail(current)} → ${redactEmail(newEmail)}`,
        );
      }
    }

    // Also set email if missing/personal on business info types
    if (
      !dirty &&
      /business/i.test(endUser.type || "") &&
      typeof attrs.email === "string" &&
      attrs.email.toLowerCase() !== newEmail.toLowerCase()
    ) {
      console.log(
        `EndUser ${objectSid}: forcing email ${redactEmail(attrs.email)} → ${redactEmail(newEmail)}`,
      );
      attrs.email = newEmail;
      dirty = true;
    }

    if (dirty) {
      try {
        await client.trusthub.v1.endUsers(objectSid).update({ attributes: attrs });
        updated.push(objectSid);
      } catch (e) {
        // Approved Customer Profiles are immutable (error 70002)
        console.warn(
          `EndUser ${objectSid} update skipped (${e.code || "err"}): ${e.message}`,
        );
      }
    } else {
      console.log(
        `EndUser ${objectSid} type=${endUser.type}: no personal email attrs to change`,
      );
    }
  }

  return { updated };
}

async function main() {
  console.log("=== Fetch TFV ===");
  let tfv = await fetchTfv();
  console.log(
    JSON.stringify(
      {
        sid: tfv.sid,
        status: tfv.status,
        tollfree_phone_number: tfv.tollfreePhoneNumber,
        notification_email: redactEmail(tfv.notificationEmail),
        business_contact_email: redactEmail(tfv.businessContactEmail),
        edit_allowed: tfv.editAllowed,
        edit_expiration: tfv.editExpiration,
        rejection_reasons: tfv.rejectionReasons,
        customer_profile_sid: tfv.customerProfileSid,
      },
      null,
      2,
    ),
  );

  if (tfv.editAllowed === false) {
    console.error("edit_allowed=false — cannot resubmit this TFV via edit API");
    process.exit(2);
  }
  if (tfv.editExpiration) {
    const exp = new Date(tfv.editExpiration);
    if (Date.now() > exp.getTime()) {
      console.warn(
        `edit_expiration ${tfv.editExpiration} has passed — resubmit may lose priority queue`,
      );
    } else {
      console.log(`Priority edit window until ${tfv.editExpiration}`);
    }
  }

  console.log("=== Trust Hub email fix ===");
  const th = await updateTrustHubEmails(tfv.customerProfileSid);
  console.log(`Trust Hub end users updated: ${th.updated.length}`);

  console.log("=== Update TFV NotificationEmail + BusinessContactEmail ===");
  const updatePayload = {
    notificationEmail: newEmail,
    businessContactEmail: newEmail,
    editReason: "Updated business email to official domain",
  };
  try {
    tfv = await client.messaging.v1.tollfreeVerifications(tfvSid).update(updatePayload);
  } catch (e) {
    if (String(e.message).toLowerCase().includes("edit reason")) {
      console.warn(`editReason rejected (${e.message}); retrying without editReason`);
      const { editReason: _er, ...rest } = updatePayload;
      tfv = await client.messaging.v1.tollfreeVerifications(tfvSid).update(rest);
    } else {
      throw e;
    }
  }

  console.log("=== After update ===");
  console.log(
    JSON.stringify(
      {
        sid: tfv.sid,
        status: tfv.status,
        notification_email: redactEmail(tfv.notificationEmail),
        business_contact_email: redactEmail(tfv.businessContactEmail),
        edit_allowed: tfv.editAllowed,
        rejection_reasons: tfv.rejectionReasons,
      },
      null,
      2,
    ),
  );

  if (tfv.status === "PENDING_REVIEW" || tfv.status === "IN_REVIEW") {
    console.log(`SUCCESS: TFV status is ${tfv.status}`);
  } else {
    console.log(
      `NOTE: status is ${tfv.status} (expected PENDING_REVIEW after successful resubmit)`,
    );
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  if (err.code) console.error("code:", err.code);
  if (err.moreInfo) console.error("moreInfo:", err.moreInfo);
  process.exit(1);
});
