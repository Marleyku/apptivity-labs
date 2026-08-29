#!/usr/bin/env node
/**
 * Seed marketing catalogs from existing screenshots into sites/public/marketing/{slug}.
 * Usage: node seed-catalogs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_SCRIPTS = path.join(process.env.HOME, '.cursor/skills/app-marketing-catalog/scripts');
const SITES = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(SITES, 'public/marketing');
const M2G_QA = '/home/marley/Code/miles2go/tmp/theme-qa-2026-08-21';
const M2G_STEEL = '/home/marley/Code/miles2go/tmp/steel-qa-2026-08-21';
const PRODUCTS = path.join(SITES, 'public/products');

function run(script, args) {
  const r = spawnSync('node', [path.join(SKILL_SCRIPTS, script), ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error(`${script} failed: ${args.join(' ')}`);
  }
}

function ensureDirs(slug) {
  for (const p of [
    'frames/top-down',
    'frames/perspective',
    'wireframes/top-down',
    'wireframes/perspective',
    'raw',
  ]) {
    fs.mkdirSync(path.join(OUT_ROOT, slug, p), { recursive: true });
  }
}

async function processShot(slug, featureId, theme, sourcePng, heroApproved = false) {
  if (!fs.existsSync(sourcePng)) {
    console.warn('skip missing', sourcePng);
    return null;
  }
  const baseName = `${featureId}-${theme}-iphone16`;
  const rawDest = path.join(OUT_ROOT, slug, 'raw', `${featureId}-${theme}.png`);
  fs.copyFileSync(sourcePng, rawDest);

  const wfRaw = path.join(OUT_ROOT, slug, 'raw', `${featureId}-${theme}-wireframe.png`);
  run('wireframe-filter.mjs', [rawDest, wfRaw]);

  const polishedPrefix = path.join(OUT_ROOT, slug, 'frames', 'tmp', baseName);
  fs.mkdirSync(path.dirname(polishedPrefix), { recursive: true });
  run('compose-iphone16.mjs', ['--screen', rawDest, '--out-prefix', polishedPrefix]);

  const wfPrefix = path.join(OUT_ROOT, slug, 'wireframes', 'tmp', baseName);
  fs.mkdirSync(path.dirname(wfPrefix), { recursive: true });
  run('compose-iphone16.mjs', ['--screen', wfRaw, '--out-prefix', wfPrefix]);

  // Move into angle folders
  const moves = [
    [`${polishedPrefix}-topdown.png`, `frames/top-down/${baseName}-topdown.png`],
    [`${polishedPrefix}-perspective.png`, `frames/perspective/${baseName}-perspective.png`],
    [`${wfPrefix}-topdown.png`, `wireframes/top-down/${baseName}-topdown.png`],
    [`${wfPrefix}-perspective.png`, `wireframes/perspective/${baseName}-perspective.png`],
  ];
  for (const [from, rel] of moves) {
    const to = path.join(OUT_ROOT, slug, rel);
    fs.renameSync(from, to);
  }

  const polishedId = `${featureId}-${theme}-polished`;
  const wireframeId = `${featureId}-${theme}-wireframe`;
  return [
    {
      id: polishedId,
      theme,
      kind: 'polished',
      topDownPath: `/marketing/${slug}/frames/top-down/${baseName}-topdown.png`,
      perspectivePath: `/marketing/${slug}/frames/perspective/${baseName}-perspective.png`,
      alt: `${slug} ${featureId} (${theme}) on iPhone 16`,
      heroApproved,
    },
    {
      id: wireframeId,
      theme,
      kind: 'wireframe',
      topDownPath: `/marketing/${slug}/wireframes/top-down/${baseName}-topdown.png`,
      perspectivePath: `/marketing/${slug}/wireframes/perspective/${baseName}-perspective.png`,
      alt: `${slug} ${featureId} wireframe (${theme}) on iPhone 16`,
      heroApproved: false,
    },
  ];
}

function score(u, n, c) {
  return { utilityScore: u, uniquenessScore: n, consequenceScore: c };
}

async function seedMiles2Go() {
  const slug = 'miles2go';
  ensureDirs(slug);
  const themes = ['light', 'dark', 'nature', 'mountain'];
  const featureScreens = [
    { id: 'dashboard', file: 'dashboard', hero: true },
    { id: 'fuel', file: 'fuel', hero: true },
    { id: 'service', file: 'service', hero: false },
    { id: 'accidents', file: 'accident', hero: false },
  ];

  const shots = [];
  for (const theme of themes) {
    for (const f of featureScreens) {
      const src = path.join(M2G_QA, `${theme}-${f.file}.png`);
      const pair = await processShot(slug, f.id, theme, src, theme === 'dark' && f.hero);
      if (pair) shots.push(...pair);
    }
  }

  // steel if available
  const steelDash = path.join(M2G_STEEL, 'steel-dashboard.png');
  const steelAlt = fs.existsSync(steelDash)
    ? steelDash
    : fs.readdirSync(M2G_STEEL).find((f) => f.includes('dashboard'))
      ? path.join(M2G_STEEL, fs.readdirSync(M2G_STEEL).find((f) => f.includes('dashboard')))
      : null;
  if (steelAlt && fs.existsSync(steelAlt)) {
    const pair = await processShot(slug, 'dashboard', 'steel', steelAlt, false);
    if (pair) shots.push(...pair);
  }

  const features = [
    {
      id: 'dashboard',
      name: 'Household dashboard',
      rank: 1,
      ...score(5, 4, 5),
      why: 'Gives the household one place to see alerts, costs, and next actions across every vehicle.',
      howToUse: 'Open the app home after sign-in; skim alerts and jump into fuel or service.',
      primaryRoute: '/',
      shotIds: ['dashboard-dark-polished', 'dashboard-light-polished'],
      marketingHook: 'The family garage at a glance — before anyone forgets an oil change.',
    },
    {
      id: 'fuel',
      name: 'Fuel & MPG log',
      rank: 2,
      ...score(5, 3, 5),
      why: 'Fill-ups are the highest-frequency cost event; logging them unlocks MPG and cost-per-mile.',
      howToUse: 'Add a fill-up from Fuel or capture via NFC/receipt; confirm odometer and gallons.',
      primaryRoute: '/fuel',
      shotIds: ['fuel-dark-polished', 'fuel-nature-polished'],
      marketingHook: 'Every fill-up becomes usable history, not a crumpled receipt.',
    },
    {
      id: 'nfc-capture',
      name: 'NFC / receipt fuel capture',
      rank: 3,
      ...score(4, 5, 4),
      why: 'Differentiates Miles2Go from spreadsheet apps — windshield tap or OCR instead of typing.',
      howToUse: 'Tap the vehicle NFC tag or scan a receipt from the capture flow.',
      primaryRoute: '/fuel/capture/vehicle/:vehicleId',
      shotIds: ['fuel-dark-polished'],
      marketingHook: 'Log fuel at the pump — not later on the couch.',
    },
    {
      id: 'service',
      name: 'Service history',
      rank: 4,
      ...score(5, 3, 5),
      why: 'Shops, DIY, and line items stay attached to the vehicle for resale and warranty proof.',
      howToUse: 'Record a service visit with shop, mileage, and what was done.',
      primaryRoute: '/service',
      shotIds: ['service-dark-polished', 'service-mountain-polished'],
      marketingHook: 'A service record that travels with the car, not the shoebox.',
    },
    {
      id: 'reminders',
      name: 'Maintenance reminders',
      rank: 5,
      ...score(5, 3, 5),
      why: 'Missed intervals destroy engines and trust; time/mileage reminders prevent that.',
      howToUse: 'Create reminders tied to mileage or calendar; act from dashboard alerts.',
      primaryRoute: '/reminders',
      shotIds: ['dashboard-dark-polished'],
      marketingHook: 'Know what is due before the dashboard light does.',
    },
    {
      id: 'vehicles',
      name: 'Shared vehicles garage',
      rank: 6,
      ...score(5, 4, 4),
      why: 'Households manage multiple cars; a garage roster is the product spine.',
      howToUse: 'Add vehicles under Vehicles; assign them to the household.',
      primaryRoute: '/vehicles',
      shotIds: ['dashboard-light-polished'],
      marketingHook: 'One garage for every driver in the household.',
    },
    {
      id: 'vehicle-tags',
      name: 'NFC vehicle tags',
      rank: 7,
      ...score(4, 5, 3),
      why: 'Physical tags make capture frictionless for whoever is driving.',
      howToUse: 'Pair tags in Settings → Vehicle tags; stick on windshield.',
      primaryRoute: '/settings/vehicle-tags',
      shotIds: ['dashboard-nature-polished'],
      marketingHook: 'The car itself becomes the shortcut.',
    },
    {
      id: 'tco',
      name: 'Total cost of ownership',
      rank: 8,
      ...score(4, 4, 4),
      why: 'Fuel alone lies; TCO shows insurance, registration, and service together.',
      howToUse: 'Open Reports → TCO for a rollup by vehicle.',
      primaryRoute: '/reports/tco',
      shotIds: ['dashboard-mountain-polished'],
      marketingHook: 'See what the car actually costs to keep.',
    },
    {
      id: 'cost-per-mile',
      name: 'Cost per mile',
      rank: 9,
      ...score(4, 3, 3),
      why: 'Turns ownership into a comparable operating metric across vehicles.',
      howToUse: 'Use Reports → Cost per mile after logging fuel and ownership costs.',
      primaryRoute: '/reports/cost-per-mile',
      shotIds: ['fuel-light-polished'],
      marketingHook: 'Compare cars by the mile, not the myth.',
    },
    {
      id: 'ownership-costs',
      name: 'Ownership costs',
      rank: 10,
      ...score(4, 3, 4),
      why: 'Insurance and registration dwarf some fuel years; they must be first-class.',
      howToUse: 'Log recurring and one-off costs under Costs.',
      primaryRoute: '/costs',
      shotIds: ['dashboard-steel-polished', 'dashboard-dark-polished'],
      marketingHook: 'The quiet bills that decide whether a car is a bargain.',
    },
    {
      id: 'household',
      name: 'Household sharing',
      rank: 11,
      ...score(4, 4, 4),
      why: 'Vehicle history is a family asset; invites keep spouses and teens on the same record.',
      howToUse: 'Invite members from Household; share the garage.',
      primaryRoute: '/household',
      shotIds: ['dashboard-dark-polished'],
      marketingHook: 'One shared history — no more “who got the oil changed?”',
    },
    {
      id: 'tires',
      name: 'Tire sets',
      rank: 12,
      ...score(3, 4, 3),
      why: 'Seasonal tire swaps are easy to lose track of across years.',
      howToUse: 'Track tire sets and rotations under Tires.',
      primaryRoute: '/tires',
      shotIds: ['service-light-polished'],
      marketingHook: 'Know which rubber is on the car this season.',
    },
    {
      id: 'accidents',
      name: 'Accident & incident log',
      rank: 13,
      ...score(3, 3, 4),
      why: 'Claims and repairs need a chronological record attached to the vehicle.',
      howToUse: 'Log incidents under Accidents with photos and notes.',
      primaryRoute: '/accidents',
      shotIds: ['accidents-dark-polished', 'accidents-light-polished'],
      marketingHook: 'When something happens, the record is already in place.',
    },
    {
      id: 'attachments',
      name: 'Receipts & attachments',
      rank: 14,
      ...score(3, 2, 3),
      why: 'Proof lives next to the event — warranty and resale both need it.',
      howToUse: 'Attach photos/PDFs from records or the Attachments library.',
      primaryRoute: '/attachments',
      shotIds: ['service-dark-polished'],
      marketingHook: 'Receipts that stay with the repair, not the junk drawer.',
    },
    {
      id: 'appearance',
      name: 'Color themes',
      rank: 15,
      ...score(3, 3, 2),
      why: 'Theme choice makes daily logging feel personal and readable in any light.',
      howToUse: 'Settings → Appearance; pick light, dark, nature, mountain, or steel.',
      primaryRoute: '/settings',
      shotIds: [
        'dashboard-light-polished',
        'dashboard-dark-polished',
        'dashboard-nature-polished',
        'dashboard-mountain-polished',
      ],
      marketingHook: 'Cockpit, trail, or daylight — same garage, your look.',
    },
  ];

  // Fix ownership-costs shotIds if steel missing
  for (const f of features) {
    f.shotIds = f.shotIds.filter((id) => shots.some((s) => s.id === id));
    if (!f.shotIds.length) f.shotIds = [shots.find((s) => s.kind === 'polished')?.id].filter(Boolean);
  }

  const catalog = {
    meta: {
      slug,
      name: 'Miles2Go',
      productUrl: 'https://www.mymiles2go.com',
      updatedAt: new Date().toISOString(),
      notes:
        'Themes captured from theme-qa (light, dark, nature, mountain) plus steel when available. Seeded from existing QA captures; regenerate via app-marketing-catalog skill after UI changes.',
    },
    targetConsumers: [
      {
        persona: 'Household vehicle coordinator',
        jobsToBeDone: [
          'Keep fuel, service, and costs in one shared place',
          'Hand a trustworthy history to a spouse or buyer',
        ],
        pains: ['Lost receipts', 'Missed oil changes', 'No shared garage record'],
      },
      {
        persona: 'Second-driver spouse or teen',
        jobsToBeDone: ['Log a fill-up quickly without learning a spreadsheet'],
        pains: ['Friction at the pump', 'Unclear what is due'],
      },
    ],
    positioning: {
      oneLiner: 'Every vehicle has a history. Miles2Go keeps the record.',
      category: 'Household vehicle history & costs',
      differentiator: 'Shared garage + NFC/receipt capture — not a solo MPG hobby tracker.',
    },
    objectionsAndAnswers: [
      {
        objection: 'I already have a notes app / spreadsheet.',
        answer: 'Spreadsheets do not remind you, share cleanly, or capture at the pump.',
      },
      {
        objection: 'We only have one car.',
        answer: 'Free plan covers one vehicle; the history still pays off at service and sale.',
      },
    ],
    proofPoints: [
      'Invite-only beta with household plans (Free / Duo / Family)',
      'NFC tags and receipt capture for low-friction fuel logs',
      'Reports for TCO and cost-per-mile',
    ],
    ctaSuggestions: ['Request invite', 'Join with household code', 'See the garage dashboard'],
    features,
    shots,
  };

  fs.writeFileSync(path.join(OUT_ROOT, slug, 'catalog.json'), JSON.stringify(catalog, null, 2));
  // cleanup tmp dirs
  for (const t of ['frames/tmp', 'wireframes/tmp']) {
    const p = path.join(OUT_ROOT, slug, t);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }
  console.log('Seeded', slug, 'shots', shots.length);
}

async function seedSimple(slug, name, productUrl, sourcePng, brief, featureDefs) {
  ensureDirs(slug);
  const themes = brief.themes || ['default'];
  const shots = [];
  for (const theme of themes) {
    const pair = await processShot(slug, 'dashboard', theme, sourcePng, true);
    if (pair) shots.push(...pair);
  }

  const features = featureDefs.map((f, i) => ({
    ...f,
    rank: i + 1,
    shotIds: f.shotIds || [`dashboard-${themes[0]}-polished`],
  }));

  for (const f of features) {
    f.shotIds = f.shotIds.filter((id) => shots.some((s) => s.id === id));
    if (!f.shotIds.length) f.shotIds = [shots.find((s) => s.kind === 'polished')?.id].filter(Boolean);
  }

  const catalog = {
    meta: {
      slug,
      name,
      productUrl,
      updatedAt: new Date().toISOString(),
      notes: brief.notes,
    },
    targetConsumers: brief.targetConsumers,
    positioning: brief.positioning,
    objectionsAndAnswers: brief.objectionsAndAnswers,
    proofPoints: brief.proofPoints,
    ctaSuggestions: brief.ctaSuggestions,
    features,
    shots,
  };

  fs.writeFileSync(path.join(OUT_ROOT, slug, 'catalog.json'), JSON.stringify(catalog, null, 2));
  for (const t of ['frames/tmp', 'wireframes/tmp']) {
    const p = path.join(OUT_ROOT, slug, t);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }
  console.log('Seeded', slug, 'shots', shots.length);
}

const favorFeatures = [
  {
    id: 'home',
    name: 'Partner home & balances',
    ...score(5, 4, 5),
    why: 'Makes effort visible at a glance — points and open work without nagging.',
    howToUse: 'Open Home to see balances and jump into tasks or favors.',
    primaryRoute: '/',
    marketingHook: 'See what each of you owes — without the scorekeeping fight.',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    ...score(5, 3, 5),
    why: 'Concrete assignments with points turn vague chore talks into clear asks.',
    howToUse: 'Create a task, set points, assign to your partner.',
    primaryRoute: '/tasks',
    marketingHook: 'Ask clearly. Earn fairly.',
  },
  {
    id: 'create-task',
    name: 'Create task',
    ...score(5, 3, 4),
    why: 'Frictionless creation keeps the bank alive day to day.',
    howToUse: 'Tasks → New; set 1–100 points and due intent.',
    primaryRoute: '/tasks/new',
    marketingHook: 'Turn “can you…?” into a fair favor.',
  },
  {
    id: 'rewards',
    name: 'Favors & rewards',
    ...score(5, 5, 4),
    why: 'Redeeming spouse-offered rewards is the emotional payoff loop.',
    howToUse: 'Browse Favors, redeem when you have points, fulfill when claimed.',
    primaryRoute: '/rewards',
    marketingHook: 'Rewards you both chose — not a generic points store.',
  },
  {
    id: 'suggestions',
    name: 'Ideas / suggestions',
    ...score(4, 4, 3),
    why: 'Partners can propose offers; pricing keeps reciprocity honest.',
    howToUse: 'Suggest an idea; partner prices or accepts into the library.',
    primaryRoute: '/suggestions',
    marketingHook: 'Propose what would actually feel good.',
  },
  {
    id: 'fulfillment',
    name: 'Fulfillment',
    ...score(4, 4, 4),
    why: 'Closing the loop on redeemed favors builds trust in the system.',
    howToUse: 'Complete fulfilled favors from the Fulfillment queue.',
    primaryRoute: '/fulfillment',
    marketingHook: 'Deliver what you promised — then clear the board.',
  },
  {
    id: 'history',
    name: 'History ledger',
    ...score(4, 3, 3),
    why: 'A shared ledger settles “I always do more” with receipts, not memory.',
    howToUse: 'Open History to review point events.',
    primaryRoute: '/history',
    marketingHook: 'The quiet record that ends the tally argument.',
  },
  {
    id: 'partner-invite',
    name: 'Partner invite',
    ...score(5, 3, 5),
    why: 'Exactly two people — invite is the product boundary.',
    howToUse: 'Invite by phone/code during onboarding or Partner.',
    primaryRoute: '/partner',
    marketingHook: 'Built for two. Not a group chat chore app.',
  },
  {
    id: 'onboarding',
    name: 'Onboarding & love languages',
    ...score(3, 4, 3),
    why: 'Sets tone and preference context before the first task.',
    howToUse: 'Complete name → love languages → invite.',
    primaryRoute: '/onboarding',
    marketingHook: 'Start with how you give — then bank the favors.',
  },
  {
    id: 'account',
    name: 'Account & appearance',
    ...score(3, 2, 2),
    why: 'Light/dark and wallpapers make daily use feel personal.',
    howToUse: 'Account → appearance; toggle theme or wallpaper.',
    primaryRoute: '/account',
    marketingHook: 'Your bank, your mood lighting.',
  },
  {
    id: 'tasks-created',
    name: 'Tasks I created',
    ...score(3, 2, 3),
    why: 'Outbound asks need a separate view so creators can follow up.',
    howToUse: 'Open Tasks I created to manage what you assigned.',
    primaryRoute: '/tasks/created',
    marketingHook: 'Track the favors you put into the world.',
  },
  {
    id: 'auth-otp',
    name: 'Phone OTP auth',
    ...score(4, 2, 4),
    why: 'Friction-light private login matches a couples app threat model.',
    howToUse: 'Sign in with phone + SMS code.',
    primaryRoute: '/auth',
    marketingHook: 'Private by default — just the two of you.',
  },
  {
    id: 'wallpaper',
    name: 'Wallpapers',
    ...score(2, 3, 1),
    why: 'Delight without clutter; seasonal presets keep the app fresh.',
    howToUse: 'Pick a wallpaper under Account.',
    primaryRoute: '/account',
    marketingHook: 'A little atmosphere for everyday kindness.',
  },
  {
    id: 'points',
    name: 'Points economy (1–100)',
    ...score(4, 4, 4),
    why: 'Bounded points keep valuation fair and gameable-but-kind.',
    howToUse: 'Set points when creating tasks or pricing suggestions.',
    primaryRoute: '/tasks/new',
    marketingHook: 'Fair weight for real effort.',
  },
  {
    id: 'library',
    name: 'Rewards library',
    ...score(3, 3, 3),
    why: 'Saved offers become a menu of meaningful redemptions.',
    howToUse: 'Use the Library tab inside Favors.',
    primaryRoute: '/rewards',
    marketingHook: 'A menu of favors worth redeeming.',
  },
];

const apptivityFeatures = [
  {
    id: 'dashboard',
    name: 'DPAR dashboard',
    ...score(5, 5, 5),
    why: 'Discover → Plan → Act → Reflect is the product spine for better group activities.',
    howToUse: 'Open Dashboard and move through Discover, Plan, Act, Reflect.',
    primaryRoute: '/dashboard',
    marketingHook: 'Activities that improve every time you run them.',
  },
  {
    id: 'discover',
    name: 'Discover',
    ...score(5, 4, 4),
    why: 'Interests and local heat turn vague “we should hang out” into signal.',
    howToUse: 'Use Discover to like interests and explore local resources.',
    primaryRoute: '/dashboard#discover',
    marketingHook: 'Find what the group actually wants to do.',
  },
  {
    id: 'plan',
    name: 'Plan',
    ...score(5, 4, 5),
    why: 'Modules and roles make plans executable, not just calendar blocks.',
    howToUse: 'Build the activity in Plan with clear ownership.',
    primaryRoute: '/dashboard#plan',
    marketingHook: 'Plans with roles — not hope and a group text.',
  },
  {
    id: 'act',
    name: 'Act',
    ...score(5, 4, 5),
    why: 'Execution view keeps guides and members aligned in the moment.',
    howToUse: 'Run the activity from Act with live roles.',
    primaryRoute: '/dashboard#act',
    marketingHook: 'Showtime with a checklist, not chaos.',
  },
  {
    id: 'reflect',
    name: 'Reflect',
    ...score(4, 5, 4),
    why: 'Reflection compounds quality across repeats — the anti-calendar insight.',
    howToUse: 'Capture what worked after each activity.',
    primaryRoute: '/dashboard#reflect',
    marketingHook: 'Leave the night better than you found it.',
  },
  {
    id: 'sherpa',
    name: 'Sherpa AI',
    ...score(4, 5, 3),
    why: 'Assists planning without replacing steward judgment.',
    howToUse: 'Open Sherpa AI for planning help.',
    primaryRoute: '/sherpa-ai',
    marketingHook: 'A guide for the plan — still your group’s call.',
  },
  {
    id: 'join-code',
    name: 'Join with code',
    ...score(4, 3, 4),
    why: 'Low-friction membership for real-world groups.',
    howToUse: 'Enter a join code from Join with code.',
    primaryRoute: '/join-with-code',
    marketingHook: 'One code. You are in.',
  },
  {
    id: 'inbox',
    name: 'Inbox & chat',
    ...score(3, 2, 3),
    why: 'Coordination stays inside the activity system.',
    howToUse: 'Use inbox/chat from the dashboard chrome.',
    primaryRoute: '/dashboard#apptivity-inbox',
    marketingHook: 'Coordination without another abandoned thread.',
  },
  {
    id: 'roles',
    name: 'Role-based participation',
    ...score(4, 4, 4),
    why: 'Stewards, guides, and spectators need different permissions.',
    howToUse: 'Assign roles when inviting or managing the group.',
    primaryRoute: '/dashboard',
    marketingHook: 'Everyone knows their job on the trail.',
  },
  {
    id: 'local-resources',
    name: 'Local resources',
    ...score(4, 4, 3),
    why: 'ZIP-aware venues/events ground Discover in place.',
    howToUse: 'Browse local resources inside Discover.',
    primaryRoute: '/dashboard#discover',
    marketingHook: 'What is near you — not generic internet ideas.',
  },
  {
    id: 'flyer',
    name: 'Activity flyer',
    ...score(3, 3, 2),
    why: 'Shareable flyers help invite beyond the app.',
    howToUse: 'Preview/share an activity flyer.',
    primaryRoute: '/preview/activity-flyer',
    marketingHook: 'Invite with a poster, not a wall of text.',
  },
  {
    id: 'onboarding',
    name: 'Onboarding trail',
    ...score(3, 3, 3),
    why: 'Founders and joiners land in the right role context.',
    howToUse: 'Complete onboarding screens into a group.',
    primaryRoute: '/onboarding/group',
    marketingHook: 'Start the trail together.',
  },
  {
    id: 'settings',
    name: 'Settings',
    ...score(2, 2, 2),
    why: 'Profile and prefs keep the group identity coherent.',
    howToUse: 'Update profile under Settings.',
    primaryRoute: '/settings',
    marketingHook: 'Your place in the group, clearly set.',
  },
  {
    id: 'beta',
    name: 'Beta portal',
    ...score(2, 2, 2),
    why: 'Early groups need a controlled on-ramp.',
    howToUse: 'Enter via /beta when invited.',
    primaryRoute: '/beta',
    marketingHook: 'Early access for real groups.',
  },
  {
    id: 'brand',
    name: 'Forest brand experience',
    ...score(3, 3, 2),
    why: 'Distinct emerald/sand identity signals calm, outdoor-ready community energy.',
    howToUse: 'Use the default light branded UI (single color experience).',
    primaryRoute: '/dashboard',
    marketingHook: 'Looks like a trailhead — not another SaaS dashboard.',
  },
];

await seedMiles2Go();

await seedSimple(
  'favorbank',
  'FavorBank',
  'https://favorbank.app',
  path.join(PRODUCTS, 'favorbank-dashboard.png'),
  {
    themes: ['light'],
    notes: 'Color themes: light/dark supported in product; seed uses polished light dashboard capture. Expand with dark + wallpaper matrix on next skill run.',
    targetConsumers: [
      {
        persona: 'Partner who wants fair chore reciprocity',
        jobsToBeDone: ['Make effort visible', 'Redeem meaningful favors'],
        pains: ['Scorekeeping fights', 'Vague asks', 'Uneven load'],
      },
    ],
    positioning: {
      oneLiner: 'Private two-person favors — make effort visible, redeem what matters.',
      category: 'Couples task & reward app',
      differentiator: 'Exactly two people; spouse-priced rewards — not family chore charts.',
    },
    objectionsAndAnswers: [
      {
        objection: 'This sounds like keeping score.',
        answer: 'It replaces fuzzy resentment with agreed points and rewards you both chose.',
      },
    ],
    proofPoints: ['Two-person boundary', 'Points + redeemable favors', 'Love-language-aware onboarding'],
    ctaSuggestions: ['Invite your partner', 'Start with one favor'],
  },
  favorFeatures
);

await seedSimple(
  'apptivity',
  'APPtivity',
  'https://www.apptivity.online',
  path.join(PRODUCTS, 'apptivity-dashboard.png'),
  {
    themes: ['brand'],
    notes: 'Single branded light experience (forest/sand). No multi-theme matrix in product settings.',
    targetConsumers: [
      {
        persona: 'Group steward (faith, youth, club)',
        jobsToBeDone: ['Run better repeatable activities', 'Coordinate roles'],
        pains: ['Calendar-only plans', 'No reflection loop', 'Uneven ownership'],
      },
    ],
    positioning: {
      oneLiner: 'Turn real interests into repeatable, high-quality group activities.',
      category: 'Group activity system (DPAR)',
      differentiator: 'Discover → Plan → Act → Reflect — not just another calendar.',
    },
    objectionsAndAnswers: [
      {
        objection: 'We already use GroupMe and Google Calendar.',
        answer: 'Those schedule; APPtivity improves the activity itself across repeats.',
      },
    ],
    proofPoints: ['DPAR loop', 'Role-based participation', 'Local resource discovery'],
    ctaSuggestions: ['Join with code', 'Request beta access'],
  },
  apptivityFeatures
);

console.log('Done. Validate with validate-catalog.mjs');
