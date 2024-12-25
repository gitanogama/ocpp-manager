import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { logger } from "../globals/logger";

/**
 * A small helper that ensures a directory exists.
 */
function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`📁 Directory created: ${dirPath}`);
  }
}

/**
 * A helper to read user input from the command line (stdin).
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

// Emulate __filename/__dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    // Prompt user for the migration name
    const inputName = await readInput("Enter migration name: ");
    logger.debug(`User input for migration name: "${inputName}"`);

    // Create a timestamp in the same style
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    logger.debug(`Generated timestamp: ${timestamp}`);

    // Convert name to lowercase, replace spaces with underscores
    const formattedName = inputName.toLowerCase().replace(/\s+/g, "_");
    logger.debug(`Formatted migration name: "${formattedName}"`);

    // Construct paths
    const migrationsDir = path.join(__dirname, "../db/migrations");
    const migrationFileName = `${timestamp}_${formattedName}.sql`;
    const migrationFilePath = path.join(migrationsDir, migrationFileName);

    // Ensure the migrations directory exists
    ensureDirSync(migrationsDir);

    // Write an initial SQL comment to the file
    await fs.promises.writeFile(
      migrationFilePath,
      "-- Write your SQL migration here\n"
    );
    logger.info(`✅ Created new migration: ${migrationFilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ An error occurred: ${error.message}`);
    } else {
      logger.error(`❌ An unknown error occurred: ${error}`);
    }
  }
})();
