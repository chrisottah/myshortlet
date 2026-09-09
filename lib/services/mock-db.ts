// lib/services/mock-db.ts

type WithId = { id: string };

export class MockRepository<T extends WithId> {
  private store: Map<string, T> = new Map();

  constructor(seed: T[] = []) {
    seed.forEach((item) => this.store.set(item.id, item));
  }

  findAll(): T[] {
    return Array.from(this.store.values());
  }

  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  findWhere(predicate: (item: T) => boolean): T[] {
    return this.findAll().filter(predicate);
  }

  findOneWhere(predicate: (item: T) => boolean): T | undefined {
    return this.findAll().find(predicate);
  }

  create(item: T): T {
    this.store.set(item.id, item);
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  count(): number {
    return this.store.size;
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}