#!/usr/bin/env node

import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { parseArgs } from "util";
import { RegistryClient } from "../api/registry-client";

const HELP_TEXT = `
${chalk.bold("Ghibli Theme Registry CLI")}

${chalk.yellow("Usage:")}
  ghibli-theme <command> [options]

${chalk.yellow("Commands:")}
  ${chalk.cyan("list")}                     List all available components
  ${chalk.cyan("get <component>")}          Download a component and its dependencies
  ${chalk.cyan("theme")}                    Get theme configuration (CSS variables)
  ${chalk.cyan("search <query>")}           Search for components
  ${chalk.cyan("help")}                     Show this help message

${chalk.yellow("Options:")}
  ${chalk.gray("--output, -o <dir>")}       Output directory (default: ./src/components/ui)
  ${chalk.gray("--style-output <dir>")}     Output directory for styles (default: ./src)
  ${chalk.gray("--lib-output <dir>")}       Output directory for lib files (default: ./src/lib)
  ${chalk.gray("--base-url <url>")}         Custom registry base URL
  ${chalk.gray("--dry-run")}                Show what would be installed without actually doing it
  ${chalk.gray("--force")}                  Overwrite existing files
  ${chalk.gray("--no-deps")}                Don't install npm dependencies

${chalk.yellow("Examples:")}
  ${chalk.gray("# List all components")}
  ghibli-theme list

  ${chalk.gray("# Install the button component")}
  ghibli-theme get button

  ${chalk.gray("# Install multiple components")}
  ghibli-theme get button input select

  ${chalk.gray("# Get theme configuration")}
  ghibli-theme theme

  ${chalk.gray("# Search for components")}
  ghibli-theme search "menu"
`;

interface CLIOptions {
  output: string;
  styleOutput: string;
  libOutput: string;
  baseUrl?: string;
  dryRun: boolean;
  force: boolean;
  noDeps: boolean;
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      output: { type: "string", short: "o", default: "./src/components/ui" },
      "style-output": { type: "string", default: "./src" },
      "lib-output": { type: "string", default: "./src/lib" },
      "base-url": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      "no-deps": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const options: CLIOptions = {
    output: values.output as string,
    styleOutput: values["style-output"] as string,
    libOutput: values["lib-output"] as string,
    baseUrl: values["base-url"] as string | undefined,
    dryRun: values["dry-run"] as boolean,
    force: values.force as boolean,
    noDeps: values["no-deps"] as boolean,
  };

  const command = positionals[0];

  if (values.help || !command) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const client = new RegistryClient({ baseUrl: options.baseUrl });

  try {
    switch (command) {
      case "list":
        await handleList(client);
        break;
      case "get":
        await handleGet(client, positionals.slice(1), options);
        break;
      case "theme":
        await handleTheme(client, options);
        break;
      case "search":
        await handleSearch(client, positionals[1]);
        break;
      case "help":
        console.log(HELP_TEXT);
        break;
      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        console.log(HELP_TEXT);
        process.exit(1);
    }
  } catch (error) {
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

async function handleList(client: RegistryClient) {
  console.log(chalk.bold("Fetching component list..."));
  const components = await client.getComponents();

  console.log(chalk.bold("\nAvailable Components:\n"));
  for (const component of components) {
    console.log(
      `  ${chalk.cyan(component.name.padEnd(20))} ${
        component.description ? chalk.gray(component.description) : ""
      }`,
    );
  }

  console.log(chalk.bold("\nAvailable Styles:\n"));
  const styles = await client.getStyles();
  for (const style of styles) {
    console.log(
      `  ${chalk.magenta(style.name.padEnd(20))} ${
        style.description ? chalk.gray(style.description) : ""
      }`,
    );
  }
}

async function handleGet(
  client: RegistryClient,
  componentNames: string[],
  options: CLIOptions,
) {
  if (componentNames.length === 0) {
    console.error(chalk.red("Please specify at least one component name"));
    process.exit(1);
  }

  const allDependencies = new Set<string>();
  const allDevDependencies = new Set<string>();
  const filesToWrite: Array<{ path: string; content: string; type: string }> =
    [];

  for (const name of componentNames) {
    console.log(chalk.bold(`\nFetching ${name}...`));
    const result = await client.getComponentWithDependencies(name);

    if (!result) {
      console.error(chalk.red(`Component "${name}" not found`));
      continue;
    }

    result.dependencies.forEach((dep) => allDependencies.add(dep));
    result.devDependencies.forEach((dep) => allDevDependencies.add(dep));

    for (const file of result.files) {
      let outputDir: string;
      switch (file.type) {
        case "registry:style":
          outputDir = options.styleOutput;
          break;
        case "registry:lib":
          outputDir = options.libOutput;
          break;
        default:
          outputDir = options.output;
      }

      const fullPath = join(outputDir, file.path);
      filesToWrite.push({
        path: fullPath,
        content: file.content,
        type: file.type,
      });
    }
  }

  if (options.dryRun) {
    console.log(chalk.bold("\nDry run - would write the following files:"));
    for (const file of filesToWrite) {
      console.log(`  ${chalk.green("+")} ${file.path}`);
    }

    if (allDependencies.size > 0 && !options.noDeps) {
      console.log(chalk.bold("\nWould install dependencies:"));
      console.log(`  ${Array.from(allDependencies).join(" ")}`);
    }

    if (allDevDependencies.size > 0 && !options.noDeps) {
      console.log(chalk.bold("\nWould install dev dependencies:"));
      console.log(`  ${Array.from(allDevDependencies).join(" ")}`);
    }
    return;
  }

  // Write files
  console.log(chalk.bold("\nWriting files..."));
  for (const file of filesToWrite) {
    if (existsSync(file.path) && !options.force) {
      console.log(
        `  ${chalk.yellow("⚠")} ${file.path} ${chalk.gray("(exists, skipping)")}`,
      );
      continue;
    }

    const dir = dirname(file.path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(file.path, file.content, "utf-8");
    console.log(`  ${chalk.green("✓")} ${file.path}`);
  }

  // Show dependency installation instructions
  if (!options.noDeps) {
    if (allDependencies.size > 0) {
      console.log(chalk.bold("\nInstall dependencies:"));
      console.log(
        chalk.cyan(`  npm install ${Array.from(allDependencies).join(" ")}`),
      );
    }

    if (allDevDependencies.size > 0) {
      console.log(chalk.bold("\nInstall dev dependencies:"));
      console.log(
        chalk.cyan(
          `  npm install -D ${Array.from(allDevDependencies).join(" ")}`,
        ),
      );
    }
  }

  console.log(chalk.bold.green("\n✨ Done!"));
}

async function handleTheme(client: RegistryClient, options: CLIOptions) {
  console.log(chalk.bold("Fetching theme configuration..."));
  const theme = await client.getThemeConfig();

  if (!theme) {
    console.error(chalk.red("Theme configuration not found"));
    return;
  }

  console.log(chalk.bold("\nCSS Variables:\n"));

  console.log(chalk.cyan("Light theme:"));
  for (const [key, value] of Object.entries(theme.cssVars.light)) {
    console.log(`  --${key}: ${value};`);
  }

  console.log(chalk.cyan("\nDark theme:"));
  for (const [key, value] of Object.entries(theme.cssVars.dark)) {
    console.log(`  --${key}: ${value};`);
  }

  if (Object.keys(theme.tailwindConfig).length > 0) {
    console.log(chalk.bold("\nTailwind Config:"));
    console.log(JSON.stringify(theme.tailwindConfig, null, 2));
  }

  // Also fetch and display the CSS file
  const styles = await client.getStyles();
  const themeStyle = styles.find((s) => s.name === "ghibli-theme-styles");

  if (themeStyle && themeStyle.files) {
    console.log(chalk.bold("\nTo install the theme styles:"));
    console.log(chalk.cyan(`  ghibli-theme get ghibli-theme-styles`));
  }
}

async function handleSearch(client: RegistryClient, query: string) {
  if (!query) {
    console.error(chalk.red("Please provide a search query"));
    process.exit(1);
  }

  console.log(chalk.bold(`Searching for "${query}"...`));
  const results = await client.searchComponents(query);

  if (results.length === 0) {
    console.log(chalk.yellow("No components found matching your query"));
    return;
  }

  console.log(chalk.bold(`\nFound ${results.length} component(s):\n`));
  for (const component of results) {
    console.log(
      `  ${chalk.cyan(component.name.padEnd(20))} ${
        component.description ? chalk.gray(component.description) : ""
      }`,
    );
  }
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
  process.exit(1);
});
