import { PROJECTIONS } from '../projections/registry';

interface Props {
  value: string;
  onChange: (projectionId: string) => void;
}

export function ProjectionPicker({ value, onChange }: Props) {
  return (
    <label className="projection-picker" title="Active 2D map projection">
      <span className="projection-picker-label">Projection</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {PROJECTIONS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}
