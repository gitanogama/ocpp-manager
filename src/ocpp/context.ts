export class GlobalContext {
  private context: {
    serialNumber?: string;
    chargerId?: number;
    lastHeartbeat?: Date;
  };

  constructor() {
    this.context = {};
  }

  get<K extends keyof typeof this.context>(key: K): (typeof this.context)[K] {
    return this.context[key];
  }

  getAll(): Readonly<typeof this.context> {
    return { ...this.context }; // Return a shallow copy to prevent direct modification
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

  clear(): void {
    this.context = {};
  }
}
