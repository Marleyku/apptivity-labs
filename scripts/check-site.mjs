import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import worker from "../worker/index.js";

const publicDir = resolve("public");
const requiredRoutes = {
  "/": "index.html",
  "/contact.html": "contact.html",
  "/privacy": "privacy.html",
  "/terms": "terms.html",
  "/sms-opt-in": "sms-opt-in.html",
  "/sms-opt-out": "sms-opt-out.html",
};

const failures = [];
const htmlFiles = readdirSync(publicDir).filter((file) => extname(file) === ".html");

for (const [route, file] of Object.entries(requiredRoutes)) {
  if (!existsSync(join(publicDir, file))) failures.push(`${route} is missing ${file}`);
}

for (const file of htmlFiles) {
  const path = join(publicDir, file);
  const html = readFileSync(path, "utf8");
  if (!/^<!doctype html>/i.test(html.trimStart())) failures.push(`${file}: missing HTML doctype`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${file}: missing a non-empty title`);
  if (!/<meta\s+name=["']viewport["']/i.test(html)) failures.push(`${file}: missing viewport metadata`);

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) failures.push(`${file}: duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);

  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const mappedFile = requiredRoutes[pathname] ?? pathname.replace(/^\//, "");
    if (!existsSync(join(publicDir, mappedFile))) failures.push(`${file}: broken internal link ${href}`);
  }
}

if (failures.length) {
  console.error(`Site validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

const redirected = await worker.fetch(
  new Request("https://apptivity.online/privacy?source=health-check"),
  { ASSETS: { fetch: () => Promise.reject(new Error("assets should not be called for apex redirects")) } },
);
if (redirected.status !== 308 || redirected.headers.get("location") !== "https://www.apptivity.online/privacy?source=health-check") {
  console.error("Canonical hostname redirect validation failed.");
  process.exit(1);
}

let assetRequested = false;
await worker.fetch(new Request("https://www.apptivity.online/"), {
  ASSETS: {
    fetch: async () => {
      assetRequested = true;
      return new Response("ok");
    },
  },
});
if (!assetRequested) {
  console.error("Canonical hostname did not delegate to the static asset binding.");
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${Object.keys(requiredRoutes).length} required routes, and canonical-host routing.`);
