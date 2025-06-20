import chalk from "chalk";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { promisify } from "util";
import registryConfig from "../registry.ts";
import { RegistryEntry } from "./schema";
import { getGitHubBaseUrl } from "./utils.ts";

const execAsync = promisify(exec);

console.log("Building registry...");

const baseUrl = await getGitHubBaseUrl();

for (const registryData of registryConfig) {
  const registry = registryData as RegistryEntry;

  registry.files = registry.files || [];

  for (const file of registry.files) {
    if (typeof file === "string") {
      let filePath: string;
      let fileType: string;

      // Handle styles (CSS files from src folder)
      if (registry.type === "registry:style") {
        filePath = `./src/${file}`;
        fileType = "registry:style";
      } else if (registry.type === "registry:lib") {
        // Handle lib files (from src/lib folder)
        filePath = `./src/lib/${file}`;
        fileType = "registry:lib";
      } else {
        // Handle components (from src/components/ui folder)
        filePath = `./src/components/ui/${file}`;
        fileType = "registry:ui";
      }

      const content = await readFile(filePath, "utf-8");
      registry.files = registry.files.filter((f) => f !== file);
      registry.files.push({
        path: file,
        content,
        // @ts-expect-error string does not satisfy, but will deal with this later
        type: fileType,
      });
    }
  }

  await writeFile(
    `./registry/${registry.name}.json`,
    JSON.stringify(registry, null, 2),
  );

  const gitHub = `${baseUrl}/${registry.name}.json`;
  const local = `http://127.0.0.1:8081/${registry.name}.json`;

  console.log(
    `Registry built for ${chalk.green.bold(registry.name)}:
  - ${chalk.bold("GitHub")}: ${chalk.blue(gitHub)}
  - ${chalk.bold("Local")}: ${chalk.blue(local)}

After pushing the changes to GitHub, users can install it by running:
${chalk.green("npx shadcn@latest add " + gitHub)}
  `,
  );
}

// Build the registry index
console.log("\n" + chalk.bold("Building registry index..."));
try {
  await execAsync("tsx scripts/build-index.ts");
} catch (error) {
  console.error(chalk.red("Failed to build registry index:"), error);
  process.exit(1);
}
