#!/usr/bin/env node
/**
 * FAB watcher tick helper — maps Linear identifiers to repos and prints a
 * machine-readable tick summary for the agent loop / automation.
 *
 * Does NOT call Linear or implement fixes. The agent (or automation) must
 * fetch issues via Linear MCP and respect the approval gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'docs/ops/.fab-watcher-seen.json');

const REPO_MAP = [
  { match: /^(M2G)-/i, team: 'Miles2Go', repo: '/home/marley/Code/miles2go', deploy: 'build+systemctl miles2go' },
  { match: /^(FVRB)-/i, team: 'FavorBank', repo: '/home/marley/Code/favorbank', deploy: 'build+pm2 favorbank' },
  { match: /^(TEA)-/i, team: 'Teaching', repo: '/home/marley/Code/teaching', deploy: 'build+serve' },
  { match: /^(CAL|CURSOR)-/i, team: 'Cursor Apps', repo: '/home/marley/Code/sites', deploy: 'npm run deploy', note: 'Prefer Page URL host for sites vs calendar' },
  { match: /^(GOA)-/i, team: 'GOATkitz', repo: '/home/marley/Code/goatkitz', deploy: 'build+systemctl goatkitz' },
];

export function mapIssueToRepo(identifier, pageUrl = '') {
  const id = String(identifier || '');
  for (const row of REPO_MAP) {
    if (row.match.test(id)) return { ...row, identifier: id };
  }
  try {
    const host = new URL(pageUrl).hostname;
    if (host.includes('apptivity.online')) {
      return { team: 'Sites', repo: '/home/marley/Code/sites', deploy: 'npm run deploy', identifier: id };
    }
    if (host.includes('createacal') || host.includes('calemarley')) {
      return { team: 'Calendar', repo: '/home/marley/Code/calendar', deploy: 'npm run deploy', identifier: id };
    }
    if (host.includes('goapptivity')) {
      return { team: 'APPtivity', repo: '/home/marley/Code/apptivity', deploy: 'restart apptivity', identifier: id };
    }
    if (host.includes('mymiles2go') || host.includes('miles2go')) {
      return { team: 'Miles2Go', repo: '/home/marley/Code/miles2go', deploy: 'build+systemctl miles2go', identifier: id };
    }
    if (host.includes('favorbank')) {
      return { team: 'FavorBank', repo: '/home/marley/Code/favorbank', deploy: 'build+pm2 favorbank', identifier: id };
    }
    if (host.includes('goatkitz')) {
      return { team: 'GOATkitz', repo: '/home/marley/Code/goatkitz', deploy: 'build+systemctl goatkitz', identifier: id };
    }
  } catch {
    /* ignore bad URL */
  }
  return { team: 'unknown', repo: null, deploy: null, identifier: id };
}

export function isAutoAuthorized({ title = '', description = '' } = {}) {
  const blob = `${title}\n${description}`;
  if (/\b-AMK\b/.test(blob)) return { ok: true, reason: '-AMK' };
  if (/Approval:\s*`?approved`?/i.test(blob)) return { ok: true, reason: 'Approval: approved' };
  return { ok: false, reason: 'needs review' };
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { seen: {}, updatedAt: null };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

/** Mark issue ids as seen. */
export function markSeen(ids = []) {
  const state = loadState();
  const now = new Date().toISOString();
  for (const id of ids) {
    if (!id) continue;
    state.seen[id] = now;
  }
  state.updatedAt = now;
  saveState(state);
  return state;
}

export function filterNew(ids = []) {
  const state = loadState();
  return ids.filter((id) => id && !state.seen[id]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2] || 'help';
  if (cmd === 'map') {
    const id = process.argv[3] || '';
    const url = process.argv[4] || '';
    console.log(JSON.stringify(mapIssueToRepo(id, url), null, 2));
  } else if (cmd === 'auth') {
    console.log(JSON.stringify(isAutoAuthorized({ title: process.argv[3] || '', description: process.argv[4] || '' }), null, 2));
  } else if (cmd === 'mark') {
    const ids = process.argv.slice(3);
    console.log(JSON.stringify(markSeen(ids), null, 2));
  } else if (cmd === 'new') {
    const ids = process.argv.slice(3);
    console.log(JSON.stringify(filterNew(ids), null, 2));
  } else {
    console.log(`Usage:
  node scripts/fab-watcher-tick.mjs map <IDENTIFIER> [pageUrl]
  node scripts/fab-watcher-tick.mjs auth "<title>" "<description>"
  node scripts/fab-watcher-tick.mjs mark <id>...
  node scripts/fab-watcher-tick.mjs new <id>...`);
  }
}
