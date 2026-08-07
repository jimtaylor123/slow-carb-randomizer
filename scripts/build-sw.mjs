import { createHash } from "node:crypto";
import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, "out");
const SW_TEMPLATE = join(ROOT, "public", "sw.js");
const SW_OUTPUT = join(OUT_DIR, "sw.js");
const PACKAGE_PATH = join(ROOT, "package.json");

const IGNORED_URLS = new Set([
  "/next.svg",
  "/vercel.svg",
  "/globe.svg",
  "/window.svg",
  "/file.svg",
]);

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await lstat(full);
    if (info.isSymbolicLink()) continue;
    if (info.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function toUrls(relPath) {
  const url = `/${relPath.split(sep).join("/")}`;
  if (IGNORED_URLS.has(url)) return [];
  if (url === "/index.html") return ["/"];
  if (url.endsWith(".html")) {
    return [url.slice(0, -".html".length), url];
  }
  return [url];
}

function replaceOnce(source, placeholder, replacement, label) {
  const updated = source.replace(placeholder, replacement);
  if (updated === source) {
    console.error(
      `build-sw: "${label}" placeholder \`${placeholder}\` not found in ${SW_TEMPLATE}; aborting`,
    );
    process.exit(1);
  }
  return updated;
}

try {
  const files = await walk(OUT_DIR);
  const urls = [...new Set(files.map((file) => toUrls(relative(OUT_DIR, file))).flat())].sort();

  const { version } = JSON.parse(await readFile(PACKAGE_PATH, "utf8"));
  const hash = createHash("sha1").update(`${version}|${urls.join("|")}`).digest("hex").slice(0, 8);

  const template = await readFile(SW_TEMPLATE, "utf8");
  const generated = replaceOnce(
    template,
    "const PRECACHE_URLS = [];",
    `const PRECACHE_URLS = ${JSON.stringify(urls)};`,
    "PRECACHE_URLS",
  );
  const withVersion = replaceOnce(
    generated,
    'const VERSION = "dev";',
    `const VERSION = "${hash}";`,
    "VERSION",
  );

  await writeFile(SW_OUTPUT, withVersion);

  const sizes = await Promise.all(files.map((file) => lstat(file)));
  const bytes = sizes.reduce((acc, info) => acc + info.size, 0);

  console.log(`sw.js: precached ${urls.length} URLs (${(bytes / 1024).toFixed(0)} KiB), version ${hash}`);
} catch (error) {
  console.error(`build-sw: failed to generate ${SW_OUTPUT}: ${error.message}`);
  process.exit(1);
}
