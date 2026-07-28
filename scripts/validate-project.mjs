import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const files = [
  "src/main.js",
  "src/lib/okf.js",
  "src/lib/answer-card.js",
  "src/lib/static-answer.js",
  "api/wizard-chat.js"
];

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing ${file}`);
}

for (const file of fs.readdirSync(path.join(root, "public/okf/projects"))) {
  JSON.parse(fs.readFileSync(path.join(root, "public/okf/projects", file), "utf8"));
}

console.log("Project structure validated.");
