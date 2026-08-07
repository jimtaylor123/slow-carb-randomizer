import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, "out");
const SW_TEMPLATE = join(ROOT, "public", "sw.js");
const SW_OUTPUT = join(OUT_DIR, "sw.js");
const PACKAGE_PATH = join(ROOT, "package.json");

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
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
  if (url === "/index.html") return ["/"];
  if (url.endsWith(".html")) {
    return [url.slice(0, -".html".length), url];
  }
  return [url];
}

const files = await walk(OUT_DIR);
const urls = [...new Set(files.map((file) => toUrls(relative(OUT_DIR, file))).flat())].sort();

const { version } = JSON.parse(await readFile(PACKAGE_PATH, "utf8"));
const hash = createHash("sha1").update(`${version}|${urls.join("|")}`).digest("hex").slice(0, 8);

const template = await readFile(SW_TEMPLATE, "utf8");
const generated = template
  .replace("const PRECACHE_URLS = [];", `const PRECACHE_URLS = ${JSON.stringify(urls)};`)
  .replace('const VERSION = "dev";', `const VERSION = "${hash}";`);

await writeFile(SW_OUTPUT, generated);

const sizes = await Promise.all(files.map((file) => stat(file)));
const bytes = sizes.reduce((acc, info) => acc + info.size, 0);

console.log(`sw.js: precached ${urls.length} URLs (${(bytes / 1024).toFixed(0)} KiB), version ${hash}`);
