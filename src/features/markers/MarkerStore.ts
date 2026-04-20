export interface Marker {
  id: string;
  name: string;
  lon: number;
  lat: number;
  description?: string;
}

type Listener = (markers: Marker[]) => void;

const STORAGE_KEY = 'global:markers:v1';

function loadFromStorage(): Marker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Marker =>
        typeof m === 'object' &&
        m !== null &&
        typeof m.id === 'string' &&
        typeof m.name === 'string' &&
        typeof m.lon === 'number' &&
        typeof m.lat === 'number',
    );
  } catch {
    return [];
  }
}

export class MarkerStore {
  private markers: Marker[] = loadFromStorage();
  private readonly listeners = new Set<Listener>();

  list(): Marker[] {
    return [...this.markers];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.list());
    return () => this.listeners.delete(listener);
  }

  add(marker: Omit<Marker, 'id'>): Marker {
    const withId: Marker = { ...marker, id: crypto.randomUUID() };
    this.markers = [...this.markers, withId];
    this.persist();
    return withId;
  }

  remove(id: string): void {
    this.markers = this.markers.filter((m) => m.id !== id);
    this.persist();
  }

  replaceAll(markers: Marker[]): void {
    this.markers = markers.map((m) => ({ ...m, id: m.id || crypto.randomUUID() }));
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.markers));
    } catch {
      // quota or privacy mode — ignore
    }
    const snap = this.list();
    this.listeners.forEach((l) => l(snap));
  }
}
