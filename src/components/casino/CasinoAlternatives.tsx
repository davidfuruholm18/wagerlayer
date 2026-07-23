import Link from "next/link";
import Image from "next/image";

import { getTrustBand } from "@/lib/trustBand";

type AlternativeCasino = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  trust_score: number | null;
};

type CasinoAlternativesProps = {
  alternatives: AlternativeCasino[];
};

export default function CasinoAlternatives({
  alternatives,
}: CasinoAlternativesProps) {
  if (alternatives.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        No verified alternatives are available yet for this casino.
      </div>
    );
  }

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
      {alternatives.map((casino) => {
        const trustBand = getTrustBand(casino.trust_score);

        return (
          <Link
            key={casino.id}
            href={`/sweepstakes-casinos/${casino.slug}`}
            className="flex w-56 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm sm:w-auto"
          >
            <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-3">
              {casino.logo_url ? (
                <Image
                  src={casino.logo_url}
                  alt={`${casino.name} logo`}
                  width={120}
                  height={60}
                  className="max-h-12 w-auto object-contain"
                />
              ) : (
                <span className="text-xs text-gray-500">No logo</span>
              )}
            </div>

            <p className="mt-4 text-base font-bold text-gray-950">
              {casino.name}
            </p>

            {trustBand ? (
              <span
                className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${trustBand.badgeBg} ${trustBand.badgeText}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${trustBand.dot}`}
                />
                {trustBand.label}
              </span>
            ) : null}

            <span className="mt-4 text-sm font-semibold text-gray-700">
              View casino →
            </span>
          </Link>
        );
      })}
    </div>
  );
}