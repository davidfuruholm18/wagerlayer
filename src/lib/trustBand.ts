export type TrustBand = {
  label: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
};

export function getTrustBand(trustScore: number | null): TrustBand | null {
  if (trustScore === null) {
    return null;
  }

  if (trustScore >= 8.5) {
    return {
      label: "Highly Trusted",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
      dot: "bg-green-500",
    };
  }

  if (trustScore >= 7.0) {
    return {
      label: "Trusted",
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-800",
      dot: "bg-sky-500",
    };
  }

  if (trustScore >= 5.0) {
    return {
      label: "Mixed Trust",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "Use Caution",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    dot: "bg-red-500",
  };
}