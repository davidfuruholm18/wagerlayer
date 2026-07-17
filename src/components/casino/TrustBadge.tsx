type TrustBadgeProps = {
  trustScore: number | null;
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

export default function TrustBadge({ trustScore }: TrustBadgeProps) {
  const trustRating = getTrustRating(trustScore);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${trustRating.className}`}
    >
      {trustRating.label}
    </span>
  );
}