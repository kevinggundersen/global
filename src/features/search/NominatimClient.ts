import { LruCache } from '../../lib/lruCache';

export interface NominatimResult {
  displayName: string;
  lat: number;
  lon: number;
  boundingBox?: [number, number, number, number];
}

interface NominatimRawResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
}

export interface NominatimClientOptions {
  userAgent: string;
  endpoint?: string;
  debounceMs?: number;
  cacheSize?: number;
  acceptLanguage?: string;
}

const DEFAULT_ENDPOINT = 'https://nominatim.openstreetmap.org';

export class NominatimClient {
  private readonly cache: LruCache<string, NominatimResult[]>;
  private lastRequestAt = 0;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: NominatimClientOptions) {
    this.cache = new LruCache(options.cacheSize ?? 64);
  }

  async search(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const cached = this.cache.get(trimmed);
    if (cached) return cached;

    await this.throttle(signal);

    const endpoint = this.options.endpoint ?? DEFAULT_ENDPOINT;
    const url = `${endpoint}/search?format=json&limit=5&q=${encodeURIComponent(trimmed)}`;
    const headers: Record<string, string> = {
      'User-Agent': this.options.userAgent,
      Accept: 'application/json',
    };
    if (this.options.acceptLanguage) headers['Accept-Language'] = this.options.acceptLanguage;

    const res = await fetch(url, { headers, signal });
    if (!res.ok) throw new Error(`Nominatim search failed: ${res.status}`);
    const raw = (await res.json()) as NominatimRawResult[];
    const mapped: NominatimResult[] = raw.map((r) => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      boundingBox: r.boundingbox
        ? [
            parseFloat(r.boundingbox[0]),
            parseFloat(r.boundingbox[1]),
            parseFloat(r.boundingbox[2]),
            parseFloat(r.boundingbox[3]),
          ]
        : undefined,
    }));
    this.cache.set(trimmed, mapped);
    return mapped;
  }

  debounced(
    query: string,
    callback: (results: NominatimResult[]) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    const delay = this.options.debounceMs ?? 500;
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
    const controller = new AbortController();
    this.pendingTimer = setTimeout(() => {
      this.search(query, controller.signal).then(callback).catch((err) => {
        if ((err as Error).name !== 'AbortError') onError?.(err);
      });
    }, delay);
    return () => {
      if (this.pendingTimer) clearTimeout(this.pendingTimer);
      controller.abort();
    };
  }

  private async throttle(signal?: AbortSignal): Promise<void> {
    const minGap = 1000;
    const now = Date.now();
    const wait = Math.max(0, this.lastRequestAt + minGap - now);
    if (wait > 0) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, wait);
        signal?.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    }
    this.lastRequestAt = Date.now();
  }
}
