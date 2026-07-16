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

const TABS: { label: string; value: FilterState["type"] }[] = [
  { label: "Network", value: "all" },
  { label: "Mentors", value: "mentor" },
  { label: "Mentees", value: "mentee" },
];

export default function Filters({ industries, onChange, filters }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-[#fdfefe]/10">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onChange({ ...filters, type: tab.value })}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filters.type === tab.value
                  ? "border-[#fdfefe] text-[#fdfefe]"
                  : "border-transparent text-[#727272] hover:text-[#fdfefe]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <select
        value={filters.industry}
        onChange={(e) => onChange({ ...filters, industry: e.target.value })}
        className="w-fit rounded-lg border border-[#fdfefe]/20 bg-[#0d1a38] px-3 py-2 text-sm text-[#fdfefe] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#727272]"
      >
        <option value="">All Industries</option>
        {industries.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>
    </div>
  );
}
