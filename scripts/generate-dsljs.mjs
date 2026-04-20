import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const dslParserPath = path.join(projectRoot, "node_modules", "@icaroglauco", "idsljs", "src", "parser.js");

async function loadDslCompiler() {
  try {
    await fs.access(dslParserPath);
  } catch {
    return null;
  }

  try {
    return await import("@icaroglauco/idsljs");
  } catch {
    return null;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return entry.isFile() && /\.(?:dsljs|idsl|dsl\.js)$/u.test(entry.name) ? [fullPath] : [];
    })
  );

  return files.flat();
}

async function removeLegacyShadow(sourcePath, getGeneratedFilePath) {
  const legacyPath = getGeneratedFilePath(sourcePath, { targetLanguage: "js" });
  if (legacyPath === sourcePath) return;
  await fs.rm(legacyPath, { force: true }).catch(() => {});
}

async function generateFile(sourcePath, compiler) {
  const {
    compileDslSource,
    getGeneratedFilePath,
    buildGeneratedFileContents
  } = compiler;
  const source = await fs.readFile(sourcePath, "utf8");
  const expanded = compileDslSource(source, { sourcePath, targetLanguage: "ts" });
  const generatedPath = getGeneratedFilePath(sourcePath, { targetLanguage: "ts" });
  const contents = buildGeneratedFileContents(sourcePath, expanded, { targetLanguage: "ts" });

  await fs.writeFile(generatedPath, contents, "utf8");
  await removeLegacyShadow(sourcePath, getGeneratedFilePath);
  return generatedPath;
}

async function main() {
  const compiler = await loadDslCompiler();
  if (!compiler) {
    console.warn("[dsljs] compiler unavailable; keeping existing generated files");
    return;
  }

  const dslFiles = (await walk(srcRoot)).sort();

  if (!dslFiles.length) {
    console.log("[dsljs] no source files found");
    return;
  }

  const generated = [];
  for (const file of dslFiles) {
    generated.push(await generateFile(file, compiler));
  }

  console.log(`[dsljs] generated ${generated.length} files`);
  for (const file of generated) {
    console.log(`- ${path.relative(projectRoot, file)}`);
  }
}

main().catch((error) => {
  console.error("[dsljs] generation failed");
  console.error(error);
  process.exitCode = 1;
});
