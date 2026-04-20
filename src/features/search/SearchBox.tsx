import { useEffect, useMemo, useRef, useState } from 'react';
import { useEngine } from '../../engine/EngineContext';
import { NominatimClient, type NominatimResult } from './NominatimClient';

const USER_AGENT =
  (import.meta.env.VITE_NOMINATIM_USER_AGENT as string | undefined) ??
  'global-globe/0.1 (https://github.com/local)';
const ENDPOINT = import.meta.env.VITE_NOMINATIM_ENDPOINT as string | undefined;

export function SearchBox() {
  const engine = useEngine();
  const client = useMemo(
    () => new NominatimClient({ userAgent: USER_AGENT, endpoint: ENDPOINT, debounceMs: 500 }),
    [],
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    cancelRef.current?.();
    cancelRef.current = client.debounced(
      query,
      (r) => {
        setResults(r);
        setOpen(true);
        setError(null);
      },
      (err) => setError(err instanceof Error ? err.message : 'Search failed'),
    );
    return () => cancelRef.current?.();
  }, [query, client]);

  const pick = (r: NominatimResult) => {
    engine.flyTo(r.lon, r.lat);
    setOpen(false);
    setQuery(r.displayName);
  };

  return (
    <div className="search-box">
      <input
        type="search"
        placeholder="Search places (Nominatim / OSM)…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(results.length > 0)}
      />
      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button type="button" onClick={() => pick(r)}>
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="search-error">{error}</div>}
    </div>
  );
}
