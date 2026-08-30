/**
 * Best-effort Linear issue creation for in-app FAB feedback (Cloudflare Worker).
 * Failures are logged; never fail the user submit.
 */

const LINEAR_API = 'https://api.linear.app/graphql';

/** Cursor Apps "Backlog" */
const DEFAULT_FEEDBACK_STATE_ID = '8ea9b562-ba0b-4e94-83e1-71e31e9ac4d0';

/** Cursor Apps "Needs Review" */
const DEFAULT_FEEDBACK_LABEL_ID = 'ce252be7-84b7-4e92-a675-dd594483fcf4';

/** Cursor Apps team */
const DEFAULT_TEAM_ID = 'a1565639-bc8b-4101-9969-8ae775e626a3';

const REVIEW_BANNER = [
  '> **NEEDS REVIEW — DO NOT IMPLEMENT YET**',
  '>',
  '> In-app FAB feedback must be **reviewed and explicitly approved** by a human',
  '> before any code changes. Agents: summarize only; wait for approval.',
].join('\n');

function linearConfigured(env) {
  return !!(env.LINEAR_API_KEY && (env.LINEAR_TEAM_ID || DEFAULT_TEAM_ID));
}

async function linearGraphql(env, query, variables) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: env.LINEAR_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors?.length) {
    const msg = json.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json.data;
}

async function uploadFileToLinear(env, bytes, contentType, filename) {
  const data = await linearGraphql(
    env,
    `mutation FileUpload($contentType: String!, $filename: String!, $size: Int!) {
      fileUpload(contentType: $contentType, filename: $filename, size: $size) {
        success
        uploadFile {
          uploadUrl
          assetUrl
          headers { key value }
        }
      }
    }`,
    { contentType, filename, size: bytes.byteLength },
  );

  const upload = data?.fileUpload;
  if (!upload?.success || !upload.uploadFile) {
    throw new Error('Linear fileUpload failed');
  }

  const { uploadUrl, assetUrl, headers: extraHeaders } = upload.uploadFile;
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=31536000');
  for (const { key, value } of extraHeaders || []) {
    headers.set(key, value);
  }

  const put = await fetch(uploadUrl, { method: 'PUT', headers, body: bytes });
  if (!put.ok) {
    throw new Error(`Linear asset PUT failed: ${put.status}`);
  }
  return assetUrl;
}

/**
 * @param {object} env
 * @param {{
 *   category: string,
 *   message: string,
 *   feedbackId: string,
 *   route?: string|null,
 *   userAgent?: string|null,
 *   site?: string|null,
 *   screenshotBytes?: ArrayBuffer|null,
 *   screenshotContentType?: string|null,
 * }} input
 */
export async function createLinearIssueFromFeedback(env, input) {
  if (!linearConfigured(env)) {
    console.warn('[feedback] LINEAR_API_KEY unset — skipping Linear sync');
    return null;
  }

  try {
    let imageMd = '';
    if (input.screenshotBytes && input.screenshotBytes.byteLength > 0) {
      const ct = input.screenshotContentType || 'image/png';
      const ext = ct.includes('jpeg') || ct.includes('jpg') ? 'jpg' : 'png';
      const assetUrl = await uploadFileToLinear(
        env,
        input.screenshotBytes,
        ct,
        `feedback-${input.feedbackId}.${ext}`,
      );
      imageMd = `\n\n![screenshot](${assetUrl})\n`;
    }

    const titleBase = (input.message || input.category || 'Feedback').trim().slice(0, 70);
    const title = `[Needs Review][${input.category}] ${titleBase}`;
    const description = [
      REVIEW_BANNER,
      '',
      input.message || '_No message_',
      '',
      '---',
      `Source: \`in-app-fab\``,
      `Approval: \`pending\``,
      `Feedback id: \`${input.feedbackId}\``,
      `Site: \`${input.site || 'apptivity.online'}\``,
      input.route ? `Route: \`${input.route}\`` : null,
      input.userAgent ? `UA: \`${String(input.userAgent).slice(0, 200)}\`` : null,
      imageMd || null,
    ]
      .filter((line) => line != null)
      .join('\n');

    const teamId = env.LINEAR_TEAM_ID || DEFAULT_TEAM_ID;
    const stateId = env.LINEAR_FEEDBACK_STATE_ID || DEFAULT_FEEDBACK_STATE_ID;
    const labelId = env.LINEAR_FEEDBACK_LABEL_ID || DEFAULT_FEEDBACK_LABEL_ID;

    const data = await linearGraphql(
      env,
      `mutation IssueCreate(
        $teamId: String!,
        $title: String!,
        $description: String!,
        $stateId: String!,
        $labelIds: [String!]
      ) {
        issueCreate(input: {
          teamId: $teamId
          title: $title
          description: $description
          stateId: $stateId
          labelIds: $labelIds
        }) {
          success
          issue { id identifier url }
        }
      }`,
      {
        teamId,
        title,
        description,
        stateId,
        labelIds: labelId ? [labelId] : [],
      },
    );

    const issue = data?.issueCreate?.issue;
    if (!data?.issueCreate?.success || !issue?.id) {
      throw new Error('Linear issueCreate failed');
    }
    console.log(`[feedback] Linear issue ${issue.identifier || issue.id} (needs review)`);
    return {
      id: issue.id,
      identifier: issue.identifier || null,
      url: issue.url || null,
    };
  } catch (err) {
    console.error('[feedback] Linear sync failed:', err?.message || err);
    return null;
  }
}

export function isLinearFeedbackConfigured(env) {
  return linearConfigured(env);
}
