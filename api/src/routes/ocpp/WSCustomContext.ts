import type { Chargers } from "../../lib/models/Chargers";

export class WSCustomContext {
  private context: {
    charger: Chargers;
  };

  constructor(ctx: typeof this.context) {
    this.context = ctx;
  }

  get<K extends keyof typeof this.context>(key: K): (typeof this.context)[K] {
    return this.context[key];
  }

  getAll(): Readonly<typeof this.context> {
    return { ...this.context };
  }

  set<K extends keyof typeof this.context>(
    key: K,
    value: (typeof this.context)[K]
  ): void {
    this.context[key] = value;
  }

  remove<K extends keyof typeof this.context>(key: K): void {
    delete this.context[key];
  }
}
