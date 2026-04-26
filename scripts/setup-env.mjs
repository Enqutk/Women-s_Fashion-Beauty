import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const pairs = [
  ["server/.env.example", "server/.env"],
  ["client/.env.local.example", "client/.env.local"],
];

for (const [sourceRel, targetRel] of pairs) {
  const source = path.join(root, sourceRel);
  const target = path.join(root, targetRel);

  if (!fs.existsSync(source)) {
    console.warn(`Skipped missing template: ${sourceRel}`);
    continue;
  }

  if (fs.existsSync(target)) {
    console.log(`Exists: ${targetRel}`);
    continue;
  }

  fs.copyFileSync(source, target);
  console.log(`Created: ${targetRel}`);
}
