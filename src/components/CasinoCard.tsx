import Image from "next/image";
import Link from "next/link";

type CasinoCardProps = {
  name: string;
  slug: string;
  logoUrl: string | null;
  establishedYear: number | null;
  minimumAge: number | null;
  trustScore: number | null;
  lastVerified: string | null;
};

function getTrustRating(trustScore: number | null) {
  if (trustScore === null) {
    return {
      label: "Not Rated",
      className: "bg-gray-100 text-gray-700",
    };
  }

  if (trustScore >= 8.5) {
    return {
      label: "Highly Trusted",
      className: "bg-green-100 text-green-700",
    };
  }

  if (trustScore >= 7) {
    return {
      label: "Trusted",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (trustScore >= 5) {
    return {
      label: "Mixed Trust",
      className: "bg-yellow-100 text-yellow-800",
    };
  }

  return {
    label: "Use Caution",
    className: "bg-red-100 text-red-700",
  };
}

export default function CasinoCard({
  name,
  slug,
  logoUrl,
  establishedYear,
  minimumAge,
  trustScore,
  lastVerified,
}: CasinoCardProps) {
  const trustRating = getTrustRating(trustScore);

  const formattedVerificationDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not verified";

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <Link href={`/sweepstakes-casinos/${slug}`} className="flex flex-1 flex-col">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                width={120}
                height={60}
                className="max-h-16 w-auto object-contain"
              />
            ) : (
              <span className="text-xs text-gray-500">No logo</span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-950">{name}</h2>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${trustRating.className}`}
            >
              {trustRating.label}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-gray-100 py-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Established
            </dt>
            <dd className="mt-1 font-semibold text-gray-900">
              {establishedYear ?? "Unknown"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Minimum age
            </dt>
            <dd className="mt-1 font-semibold text-gray-900">
              {minimumAge ? `${minimumAge}+` : "Unknown"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-gray-500">
          Last verified {formattedVerificationDate}
        </p>

        <div className="mt-5 rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800">
          View Casino
        </div>
      </Link>
    </article>
  );
}