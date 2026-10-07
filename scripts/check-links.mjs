import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = JSON.parse(fs.readFileSync("scripts/public-files.json", "utf8")).filter((file) => file.endsWith(".md"));
let count = 0;
const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1];
    if (/^https:\/\//.test(href)) continue; // External destinations get separate anonymous release verification.
    const [target, fragment] = href.split("#");
    const resolved = path.resolve(path.dirname(file), target || path.basename(file));
    if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved)) failures.push({ file, issue: "broken-local-link" });
    else if (fragment) {
      const headings = [...fs.readFileSync(resolved, "utf8").matchAll(/^#+\s+(.+)$/gm)].map((m) => m[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-"));
      if (!headings.includes(fragment)) failures.push({ file, issue: "missing-heading" });
    }
    count++;
  }
}
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", markdownFiles: files.length, checkedLocalLinks: count, failures }, null, 2));
if (failures.length) process.exitCode = 1;
