import type { ProviderDescriptor, ProviderFactory, ProviderInstance } from './types';

export class ProviderRegistry {
  private readonly factories = new Map<string, ProviderFactory>();

  register(factory: ProviderFactory): void {
    const { id } = factory.descriptor;
    if (this.factories.has(id)) {
      throw new Error(`Provider already registered: ${id}`);
    }
    this.factories.set(id, factory);
  }

  has(id: string): boolean {
    return this.factories.has(id);
  }

  get(id: string): ProviderFactory | undefined {
    return this.factories.get(id);
  }

  list(): ProviderDescriptor[] {
    return [...this.factories.values()].map((f) => f.descriptor);
  }

  listByKind(kind: ProviderDescriptor['kind']): ProviderDescriptor[] {
    return this.list().filter((d) => d.kind === kind);
  }

  async create(id: string, options?: Record<string, unknown>): Promise<ProviderInstance> {
    const factory = this.factories.get(id);
    if (!factory) {
      throw new Error(`Unknown provider: ${id}`);
    }
    return await factory.create(options);
  }
}
