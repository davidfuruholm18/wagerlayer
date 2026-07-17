import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type CasinoHeroProps = {
  name: string;
  logoUrl: string | null;
  establishedYear: number | null;
  minimumAge: number | null;
  trustScore: number | null;
  lastVerified: string | null;
  primaryUrl: string | null;
  verdict: string;
  summary: string;
  recommendedFor: string[];
  notIdealFor: string[];
  offerTitle: string;
  offerSubtitle: string;
  availableStates: number;
  minimumRedemption: string;
};

type QuickFactProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

function getTrustBand(trustScore: number | null) {
  if (trustScore === null) {
    return "Not Rated";
  }

  if (trustScore >= 8.5) {
    return "Highly Trusted";
  }

  if (trustScore >= 7) {
    return "Trusted";
  }

  if (trustScore >= 5) {
    return "Mixed Trust";
  }

  return "Use Caution";
}

function QuickFact({ label, value, icon }: QuickFactProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5">
      <dt className="flex min-w-0 items-center gap-3 text-sm text-gray-600">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </span>

        <span>{label}</span>
      </dt>

      <dd className="shrink-0 text-right text-sm font-semibold text-gray-950">
        {value}
      </dd>
    </div>
  );
}

export default function CasinoHero({
  name,
  logoUrl,
  establishedYear,
  trustScore,
  lastVerified,
  primaryUrl,
  verdict,
  summary,
  recommendedFor,
  notIdealFor,
  offerTitle,
  offerSubtitle,
  availableStates,
  minimumRedemption,
}: CasinoHeroProps) {
  const formattedVerificationDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not verified";

  const trustBand = getTrustBand(trustScore);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[3fr_2fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="relative h-28 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-gray-500">No logo</span>
              </div>
            )}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            {name}
          </h1>

          <div className="mt-6 border-l-4 border-green-500 pl-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              WagerLayer verdict
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-700">
                ✓
              </span>

              <p className="text-2xl font-bold tracking-tight text-gray-950">
                {verdict}
              </p>
            </div>

            <p className="mt-3 max-w-xl text-base leading-7 text-gray-600">
              {summary}
            </p>
          </div>

          <div className="mt-7">
            {primaryUrl ? (
              <a
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-8 py-3 text-center font-semibold text-white transition hover:bg-green-800"
              >
                Claim Bonus
              </a>
            ) : null}

            <div className="mt-4">
              <Link
                href="#alternatives"
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 transition hover:text-gray-950"
              >
                Compare alternatives
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-9">
          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-md">
            <div className="flex items-center justify-between gap-4 border-b border-amber-100 bg-amber-50 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                Current offer
              </p>

              <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-950">
                Best Offer
              </span>
            </div>

            <div className="p-6">
              <p className="text-3xl font-bold tracking-tight text-gray-950">
                {offerTitle}
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-700">
                {offerSubtitle}
              </p>

              {primaryUrl ? (
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-center font-semibold text-gray-950 transition hover:bg-amber-400"
                >
                  Claim This Offer
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Quick facts
            </h2>

            <dl className="mt-4 grid gap-3">
              <QuickFact
                label="Trust"
                value={trustBand}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6l-7-3Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <QuickFact
  label="Availability"
  value={
    <Link
      href="#states"
      className="underline decoration-gray-300 underline-offset-4 transition hover:decoration-gray-950"
    >
      {availableStates} states
    </Link>
  }
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                }
              />

              <QuickFact
                label="Minimum redemption"
                value={minimumRedemption}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="6"
                      width="18"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M16 12h.01M7 9.5h4M7 14.5h4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />

              <QuickFact
                label="Established"
                value={establishedYear?.toString() ?? "Unknown"}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10h16M6 10v8m4-8v8m4-8v8m4-8v8M3 20h18M12 3l9 4H3l9-4Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <QuickFact
                label="Last verified"
                value={formattedVerificationDate}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m8.5 12 2.2 2.2 4.8-4.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </dl>
          </div>
        </div>
      </div>

      <div className="grid border-t border-gray-200 md:grid-cols-[3fr_2fr]">
        <div className="p-7 sm:p-9 lg:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
              ✓
            </span>

            <h2 className="text-xl font-bold text-gray-950">
              Recommended for
            </h2>
          </div>

          <ul className="mt-6 space-y-4">
            {recommendedFor.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-6 text-gray-700 sm:text-base"
              >
                <span className="mt-0.5 font-bold text-green-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200 p-7 sm:p-9 md:border-l md:border-t-0 lg:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700">
              ×
            </span>

            <h2 className="text-xl font-bold text-gray-950">Not ideal for</h2>
          </div>

          <ul className="mt-6 space-y-4">
            {notIdealFor.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-6 text-gray-700 sm:text-base"
              >
                <span className="mt-0.5 font-bold text-red-500">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}