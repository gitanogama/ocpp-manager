import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";

const __filename = new URL(import.meta.url).pathname;
const __dirname = dirname(__filename);

async function readInput(prompt: string): Promise<string> {
  const buf = new Uint8Array(1024);
  Deno.stdout.writeSync(new TextEncoder().encode(prompt));
  const n = await Deno.stdin.read(buf);

  // Handle the case where n is null
  if (n === null) {
    throw new Error("Failed to read input. Please try again.");
  }

  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

(async () => {
  try {
    const inputName = await readInput("Enter migration name: ");
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const formattedName = inputName.toLowerCase().replace(/\s+/g, "_");
    const migrationsDir = join(__dirname, "../db/migrations");
    const migrationFileName = `${timestamp}_${formattedName}.sql`;
    const migrationFilePath = join(migrationsDir, migrationFileName);

    ensureDirSync(migrationsDir); // Ensure the migrations directory exists

    await Deno.writeTextFile(
      migrationFilePath,
      "-- Write your SQL migration here\n"
    );
    console.log(`✅ Created new migration: ${migrationFilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      // Handle the error safely
      console.error("❌ An error occurred:", error.message);
    } else {
      // Fallback for unknown error types
      console.error("❌ An unknown error occurred:", error);
    }
  }
})();
