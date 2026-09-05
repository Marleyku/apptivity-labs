#!/usr/bin/env node
/**
 * CURSOR-395 follow-up: Fix TFV 30507 (opt-in congruent with use case) / harden 30504.
 * Keeps VIA_TEXT + all six use-case categories. Loads secrets from sites/.env.
 *
 * Usage: node scripts/resubmit-tfv-optin.js
 */
import "dotenv/config";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const tfvSid = process.env.TWILIO_TFV_SID;
const businessEmail = process.env.NEW_BUSINESS_EMAIL || "hi@apptivity.online";

const USE_CASE_CATEGORIES = [
  "TWO_FACTOR_AUTHENTICATION",
  "ACCOUNT_NOTIFICATIONS",
  "CUSTOMER_CARE",
  "DELIVERY_NOTIFICATIONS",
  "EVENTS",
  "SECURITY_ALERT",
];

const OPT_IN_URLS = [
  "https://www.apptivity.online/sms-opt-in",
  "https://www.favorbank.app/sms-opt-in",
  "https://www.mymiles2go.com/sms-opt-in",
  "https://www.goapptivity.com/sms-opt-in",
  "https://sms-opt-in.kunzlerfamily.com/",
];

const USE_CASE_SUMMARY =
  "APPtivity Labs, LLC sends transactional/service SMS only across six informational types: " +
  "verification/2FA codes; account notifications; customer care replies; delivery/fulfillment notices; " +
  "event/schedule/reminder notices; and security alerts. No marketing or promotional SMS. " +
  "Users opt in by texting START or Y (VIA_TEXT). Consent is not a condition of purchase.";

const OPT_IN_CONFIRMATION =
  "APPtivity Labs: You’re subscribed to transactional SMS for verification codes, account notifications, " +
  "customer care, delivery notices, event/schedule reminders, and security alerts. Msg&data rates may apply. " +
  "Reply HELP for help, STOP to cancel. https://www.apptivity.online/sms-opt-in";

const HELP_MESSAGE =
  "APPtivity Labs Support: Transactional SMS for verification, account notices, customer care, " +
  "delivery notices, events/reminders, and security alerts. Msg&data rates may apply. Reply STOP to cancel. " +
  "Help: hi@apptivity.online · https://www.apptivity.online/sms-opt-in";

const PRODUCTION_SAMPLE =
  "APPtivity Labs: Your verification code is 123456. Do not share this code. Reply STOP to cancel.";

const ADDITIONAL_INFORMATION =
  "Single VIA_TEXT service consent (keywords START and Y) covers the six listed informational/transactional " +
  "message types only. Message types are named on each opt-in page and in confirmation/HELP copy. " +
  "This program does not send promotional or marketing SMS. Opt-in evidence URLs document text keyword " +
  "consent (not a website form checkbox). Sample messages per type are shown on the opt-in pages.";

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

function summarizeTfv(tfv) {
  return {
    sid: tfv.sid,
    status: tfv.status,
    tollfree_phone_number: tfv.tollfreePhoneNumber,
    notification_email: redactEmail(tfv.notificationEmail),
    business_contact_email: redactEmail(tfv.businessContactEmail),
    opt_in_type: tfv.optInType,
    opt_in_keywords: tfv.optInKeywords,
    use_case_categories: tfv.useCaseCategories,
    edit_allowed: tfv.editAllowed,
    edit_expiration: tfv.editExpiration,
    rejection_reasons: tfv.rejectionReasons,
  };
}

async function main() {
  console.log("=== Fetch TFV (before) ===");
  let tfv = await fetchTfv();
  console.log(JSON.stringify(summarizeTfv(tfv), null, 2));

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

  const updatePayload = {
    optInType: "VIA_TEXT",
    optInKeywords: ["START", "Y"],
    optInImageUrls: OPT_IN_URLS,
    useCaseCategories: USE_CASE_CATEGORIES,
    useCaseSummary: USE_CASE_SUMMARY,
    productionMessageSample: PRODUCTION_SAMPLE,
    optInConfirmationMessage: OPT_IN_CONFIRMATION,
    helpMessageSample: HELP_MESSAGE,
    additionalInformation: ADDITIONAL_INFORMATION,
    notificationEmail: businessEmail,
    businessContactEmail: businessEmail,
    editReason:
      "Aligned VIA_TEXT opt-in pages and consent copy with all six transactional use-case categories (fix 30507; harden 30504).",
  };

  console.log("=== Update TFV opt-in / consent fields (keeping 6 categories, VIA_TEXT) ===");
  console.log(
    JSON.stringify(
      {
        optInType: updatePayload.optInType,
        optInKeywords: updatePayload.optInKeywords,
        useCaseCategories: updatePayload.useCaseCategories,
        optInImageUrls: updatePayload.optInImageUrls,
        notification_email: redactEmail(businessEmail),
        business_contact_email: redactEmail(businessEmail),
      },
      null,
      2,
    ),
  );

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

  console.log("=== Fetch TFV (after) ===");
  tfv = await fetchTfv();
  console.log(JSON.stringify(summarizeTfv(tfv), null, 2));

  if (tfv.status === "PENDING_REVIEW" || tfv.status === "IN_REVIEW") {
    console.log(`SUCCESS: TFV status is ${tfv.status}`);
  } else {
    console.log(
      `NOTE: status is ${tfv.status} (expected PENDING_REVIEW or IN_REVIEW after successful resubmit)`,
    );
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  if (err.code) console.error("code:", err.code);
  if (err.moreInfo) console.error("moreInfo:", err.moreInfo);
  process.exit(1);
});
