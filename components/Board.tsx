"use client";

import { useState } from "react";
import Card, { Profile } from "./Card";
import Filters, { FilterState } from "./Filters";
import RequestModal from "./RequestModal";

type Props = {
  profiles: Profile[];
};

export default function Board({ profiles }: Props) {
  const [filters, setFilters] = useState<FilterState>({ industry: "", type: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const industries = Array.from(new Set(profiles.map((p) => p.industry))).sort();

  const filtered = profiles.filter((p) => {
    if (filters.industry && p.industry !== filters.industry) return false;
    if (filters.type !== "all" && p.type !== filters.type) return false;
    return true;
  });

  const target = profiles.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <div className="mb-6">
        <Filters industries={industries} filters={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500 py-16">No profiles match your filters.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} profile={p} onRequestMatch={setSelectedId} />
          ))}
        </div>
      )}

      <RequestModal target={target} onClose={() => setSelectedId(null)} />
    </>
  );
}
