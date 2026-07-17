import CasinoCard from "@/components/CasinoCard";
import { supabase } from "@/lib/supabase";

export default async function CasinosPage() {
  const { data: casinos, error } = await supabase
    .from("casinos")
    .select(
      "id, name, slug, logo_url, established_year, min_age, trust_score, last_verified_at"
    )
    .eq("status", "active")
    .order("name");

  if (error) {
    throw new Error(`Failed to load casinos: ${error.message}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Sweepstakes Casinos
        </h1>

        <p className="mt-2 text-gray-600">
          Compare verified sweepstakes casinos.
        </p>
      </header>

      {casinos.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          No active casinos have been added yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {casinos.map((casino) => (
            <CasinoCard
              key={casino.id}
              name={casino.name}
              slug={casino.slug}
              logoUrl={casino.logo_url}
              establishedYear={casino.established_year}
              minimumAge={casino.min_age}
              trustScore={casino.trust_score}
              lastVerified={casino.last_verified_at}
            />
          ))}
        </div>
      )}
    </main>
  );
}