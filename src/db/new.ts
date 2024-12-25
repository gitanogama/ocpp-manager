// create-migration.ts (Node.js ESM + TypeScript / JavaScript)

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

/**
 * A small helper that ensures a directory exists.
 * Similar to Deno's ensureDirSync, but for Node.
 */
function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * A helper to read user input from the command line (stdin).
 * Replaces the Deno.stdin approach.
 */
function readInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// In ESM, we can emulate __filename/__dirname with the following:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    // 1) Prompt user for the migration name
    const inputName = await readInput("Enter migration name: ");

    // 2) Create a timestamp in the same style
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    // 3) Convert name to lowercase, replace spaces with underscores
    const formattedName = inputName.toLowerCase().replace(/\s+/g, "_");

    // 4) Construct paths
    const migrationsDir = path.join(__dirname, "../db/migrations");
    const migrationFileName = `${timestamp}_${formattedName}.sql`;
    const migrationFilePath = path.join(migrationsDir, migrationFileName);

    // 5) Ensure the migrations directory exists
    ensureDirSync(migrationsDir);

    // 6) Write an initial SQL comment to the file
    await fs.promises.writeFile(
      migrationFilePath,
      "-- Write your SQL migration here\n"
    );

    // 7) Log success
    console.log(`✅ Created new migration: ${migrationFilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ An error occurred:", error.message);
    } else {
      console.error("❌ An unknown error occurred:", error);
    }
  }
})();
