"use client";

export type FilterState = {
  industry: string;
  type: "all" | "mentor" | "mentee";
};

type Props = {
  industries: string[];
  onChange: (filters: FilterState) => void;
  filters: FilterState;
};

export default function Filters({ industries, onChange, filters }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.industry}
        onChange={(e) => onChange({ ...filters, industry: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All industries</option>
        {industries.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as FilterState["type"] })
        }
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">Mentors &amp; mentees</option>
        <option value="mentor">Mentors only</option>
        <option value="mentee">Mentees only</option>
      </select>
    </div>
  );
}
