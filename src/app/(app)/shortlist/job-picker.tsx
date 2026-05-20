"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function JobPicker({ jobs, selectedId }: { jobs: { id: string; title: string }[]; selectedId?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <select
      name="job"
      defaultValue={selectedId}
      onChange={(e) => {
        const params = new URLSearchParams(sp);
        params.set("job", e.target.value);
        router.push(`?${params.toString()}`);
      }}
      className="input"
    >
      {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
    </select>
  );
}
