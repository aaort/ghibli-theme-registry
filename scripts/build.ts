import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import registryConfig from "../registry.ts";
import { RegistryEntry } from "./schema";
import { getGitHubBaseUrl } from "./utils.ts";

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
