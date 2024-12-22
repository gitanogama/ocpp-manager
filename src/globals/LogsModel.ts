import { ensureDir } from "https://deno.land/std@0.200.0/fs/ensure_dir";
import { join } from "https://deno.land/std@0.200.0/path/join";

export class LogsModel {
  private static readonly RETRY_DELAY = 100; // ms
  private static readonly MAX_RETRIES = 5;

  static async showLatestLines(linesCount = 100): Promise<string[]> {
    await ensureDir(logDir);
    const latestLog = await this.getLatestLogFile();
    if (!latestLog) return [];

    const filePath = join(logDir, latestLog);
    let attempts = 0;
    let lines: string[] = [];

    while (attempts < this.MAX_RETRIES) {
      try {
        const fileContent = await Deno.readTextFile(filePath);
        lines = fileContent
          .split("\n")
          .filter((line) => line.trim())
          .slice(-linesCount);

        // If we got some content, break the retry loop
        if (lines.length > 0) break;

        // If no content, wait and retry
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        attempts++;
      } catch (error) {
        if (error instanceof Deno.errors.PermissionDenied) throw error;
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        attempts++;
      }
    }

    return lines;
  }

  static async downloadAllAsStream(): Promise<ReadableStream<Uint8Array>> {
    await ensureDir(logDir);
    const files = await this.getSortedLogFiles();

    async function* streamGenerator() {
      const encoder = new TextEncoder();

      for (const file of files) {
        const filePath = join(logDir, file);
        let lastSize = 0;
        let stable = false;
        let stableCount = 0;

        while (!stable) {
          try {
            const stats = await Deno.stat(filePath);
            const currentSize = stats.size;

            // If file size hasn't changed in 3 checks, consider it stable
            if (currentSize === lastSize) {
              stableCount++;
              if (stableCount >= 3) {
                stable = true;
              }
            } else {
              stableCount = 0;
              lastSize = currentSize;
            }

            // Read the entire file content
            const content = await Deno.readTextFile(filePath);
            yield encoder.encode(content);

            if (!stable) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (error) {
            if (error instanceof Deno.errors.PermissionDenied) throw error;
            // For other errors, wait briefly and continue
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Add a newline between files
        yield encoder.encode("\n");
      }
    }

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerator()) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  private static async getLatestLogFile(): Promise<string | null> {
    const files = await this.getSortedLogFiles();
    return files.length > 0 ? files[files.length - 1] : null;
  }

  private static async getSortedLogFiles(): Promise<string[]> {
    const entries: string[] = [];
    for await (const entry of Deno.readDir(logDir)) {
      if (entry.isFile && entry.name.endsWith(".log")) {
        entries.push(entry.name);
      }
    }

    // Sort oldest -> newest
    return entries.sort((a, b) => {
      const dateA = a.split(".")[0];
      const dateB = b.split(".")[0];
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }
}
