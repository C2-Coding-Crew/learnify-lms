type Listener = (event: any) => void;

class PubSub {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(channel: string, listener: Listener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);

    return () => {
      this.listeners.get(channel)?.delete(listener);
    };
  }

  publish(channel: string, event: any) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel)!.forEach((listener) => listener(event));
    }
  }
}

export const pubsub = new PubSub();
