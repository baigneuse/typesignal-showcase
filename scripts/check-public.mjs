import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rules = [
  ["credential", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}|\bwhsec_[A-Za-z0-9]{12,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}/],
  ["credential", /\bAKIA[A-Z0-9]{16}\b|\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/],
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["database-connection", /postgres(?:ql)?:\/\/|mongodb(?:\+srv)?:\/\//i],
  ["credential-assignment", /(?:password|api[_-]?key|access[_-]?token|client[_-]?secret|service[_-]?role[_-]?key)\s*[=:]\s*["'][A-Za-z0-9/+_=.-]{8,}["']/i],
  ["private-path", /[A-Za-z]:[\\/](?:Users|Documents|Workspace|home)[\\/]|\/(?:Users|home)\/[A-Za-z0-9._-]+\//i],
  ["provider-identifier", /\b(?:prj|team|dpl|acct|cus|pi|cs_live|cs_test|price|prod|evt)_[A-Za-z0-9]{12,}\b/],
  ["provider-host", /\b[a-z0-9.-]+\.(?:supabase\.co|supabase\.com|vercel\.app)\b/i],
  ["source-map", /[#@]\s*sourceMappingURL\s*=/],
];
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const noreplyPattern = /^(?:\d+\+)?[A-Za-z0-9-]+@users\.noreply\.github\.com$/;

function allowedUrl(raw, file) {
  let url;
  try { url = new URL(raw.replace(/[.,;]+$/, "")); } catch { return false; }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return false;
  if (url.hostname === "typesignal.app") return ["/", "/ja", "/en", "/zh-cn", "/zh-tw"].includes(url.pathname);
  if (url.hostname === "github.com" && /^\/(?:baigneuse\/typesignal-showcase|actions\/(?:checkout|setup-node))(?:\/|$)/.test(url.pathname)) return true;
  if (file === "package-lock.json") {
    return ["registry.npmjs.org", "opencollective.com", "eslint.org"].includes(url.hostname) ||
      (url.hostname === "github.com" && url.pathname.startsWith("/sponsors/"));
  }
  return false;
}

/** Report categories only, never matched values or raw source lines. */
export function scanText(file, text) {
  const issues = [];
  for (const [category, pattern] of rules) if (pattern.test(text)) issues.push({ file, category });
  for (const email of text.match(emailPattern) ?? []) {
    if (!noreplyPattern.test(email)) issues.push({ file, category: "personal-email" });
  }
  for (const url of text.match(/https?:\/\/[^\s<>"'`)\]}]+/g) ?? []) {
    if (!allowedUrl(url, file)) issues.push({ file, category: "unapproved-url" });
  }
  return issues;
}

export function scanFileName(file, allowlist, generated = false) {
  if (/(?:^|\/)(?:\.env[^/]*|\.vercel|logs?|\.DS_Store)(?:\/|$)|\.(?:map|pem|key|log|pid|sql|db|sqlite|zip|tar|gz)$/i.test(file)) {
    return [{ file, category: "prohibited-file" }];
  }
  if (generated && /^dist\/(?:src|tests|examples)\/[a-z-]+(?:\.test)?\.js$/.test(file)) return [];
  return allowlist.has(file) ? [] : [{ file, category: "not-allowlisted" }];
}

function walk(root, relative = "") {
  const files = [];
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const file = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Symlink export is not permitted");
    if (entry.isDirectory()) files.push(...walk(root, file));
    else files.push(file);
  }
  return files;
}

const git = (args, options = {}) => execFileSync("git", args, { encoding: "utf8", windowsHide: true, stdio: ["pipe", "pipe", "pipe"], ...options }).trim();

export function auditHistory(root, allowlist) {
  // Prevent accidentally inspecting a parent private repository from a staging directory.
  if (path.resolve(git(["rev-parse", "--show-toplevel"])) !== path.resolve(root)) throw new Error("Independent Git root required");
  const roots = git(["rev-list", "--max-parents=0", "--all"]).split("\n").filter(Boolean);
  if (roots.length !== 1) throw new Error("Exactly one clean history root required");
  const issues = [];
  const commits = git(["rev-list", "--all"]).split("\n").filter(Boolean);
  const blobPaths = new Map();
  for (const commit of commits) {
    const identity = git(["show", "-s", "--format=%ae%x00%ce", commit]).split("\0");
    if (!identity.every((email) => noreplyPattern.test(email))) issues.push({ file: "git/commit", category: "non-noreply-identity" });
    for (const entry of git(["ls-tree", "-r", commit]).split("\n").filter(Boolean)) {
      const [header, file] = entry.split("\t");
      const [mode, type, oid] = header.split(" ");
      if (type !== "blob" || mode !== "100644") issues.push({ file, category: "unexpected-git-entry" });
      issues.push(...scanFileName(file, allowlist));
      blobPaths.set(oid, file);
    }
  }
  // Includes unreachable objects locally, not just the latest tree or referenced branches.
  const objects = git(["cat-file", "--batch-all-objects", "--batch-check=%(objectname) %(objecttype)"]).split("\n").filter(Boolean);
  for (const object of objects) {
    const [oid, type] = object.split(" ");
    if (type === "tag") issues.push({ file: "git/tag", category: "unexpected-tag" });
    if (type === "commit" && !commits.includes(oid)) issues.push({ file: "git/unreachable", category: "unreviewed-commit" });
    if (type === "blob" && !blobPaths.has(oid)) issues.push({ file: "git/unreachable", category: "unreviewed-blob" });
    const text = git(["cat-file", "-p", oid]);
    issues.push(...scanText(blobPaths.get(oid) ?? `git/${type}`, text));
  }
  return { roots: roots.length, commits: commits.length, objects: objects.length, issues };
}

export function main(args = process.argv.slice(2)) {
  const root = process.cwd();
  const names = JSON.parse(fs.readFileSync(path.join(root, "scripts/public-files.json"), "utf8"));
  const allowlist = new Set(names);
  if (names.length !== allowlist.size) throw new Error("Duplicate allowlist entries");
  const files = walk(root);
  const issues = [];
  for (const file of files) {
    issues.push(...scanFileName(file, allowlist, true));
    const content = fs.readFileSync(path.join(root, file));
    if (content.includes(0)) issues.push({ file, category: "unexpected-binary" });
    issues.push(...scanText(file, content.toString("utf8")));
  }
  for (const file of names) if (!files.includes(file)) issues.push({ file, category: "missing-reviewed-file" });
  const history = args.includes("--history") ? auditHistory(root, allowlist) : undefined;
  if (history) issues.push(...history.issues);
  const unique = [...new Map(issues.map((issue) => [JSON.stringify(issue), issue])).values()];
  console.log(JSON.stringify({ status: unique.length ? "BLOCKED" : "PASS", reviewedFiles: names.length, scannedFiles: files.length, history: history ? { roots: history.roots, commits: history.commits, objects: history.objects } : "NOT_REQUESTED", findings: unique }, null, 2));
  if (unique.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch { console.error("PUBLIC_SCAN_BLOCKED: scanner configuration or independent Git history unavailable; raw error suppressed"); process.exitCode = 1; }
}
