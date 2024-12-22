import { join } from "https://deno.land/std@0.200.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { logDir } from "../globals/logger.ts";

export class LogsModel {
  static async streamLogs(
    maxLines?: number
  ): Promise<ReadableStream<Uint8Array>> {
    await ensureDir(logDir);
    const files = await this.getSortedLogFiles();
    files.reverse();

    async function* streamGenerator() {
      const encoder = new TextEncoder();
      let totalLinesStreamed = 0;

      for (const file of files) {
        if (maxLines !== undefined && totalLinesStreamed >= maxLines) {
          break;
        }

        const filePath = join(logDir, file);
        let lastSize = 0;
        let stable = false;
        let stableCount = 0;

        while (!stable) {
          try {
            const stats = await Deno.stat(filePath);
            const currentSize = stats.size;

            if (currentSize === lastSize) {
              stableCount++;
              if (stableCount >= 3) {
                stable = true;
              }
            } else {
              stableCount = 0;
              lastSize = currentSize;
            }

            const content = await Deno.readTextFile(filePath);
            const lines = content.split("\n").filter((line) => line.trim());
            lines.reverse();

            const remainingLines =
              maxLines !== undefined
                ? maxLines - totalLinesStreamed
                : lines.length;

            if (remainingLines <= 0) break;

            const selectedLines = lines.slice(0, remainingLines);
            totalLinesStreamed += selectedLines.length;

            const output = selectedLines.join("\n") + "\n";
            if (output.trim()) {
              yield encoder.encode(output);
            }

            if (!stable) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (error) {
            if (error instanceof Deno.errors.PermissionDenied) throw error;
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
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

  private static async getSortedLogFiles(): Promise<string[]> {
    const entries: string[] = [];
    for await (const entry of Deno.readDir(logDir)) {
      if (entry.isFile && entry.name.endsWith(".log")) {
        entries.push(entry.name);
      }
    }

    return entries.sort((a, b) => {
      const dateA = a.split(".")[0];
      const dateB = b.split(".")[0];
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }
}
