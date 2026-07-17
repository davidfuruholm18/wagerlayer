import Link from "next/link";
import { notFound } from "next/navigation";

import CasinoHero from "@/components/casino/CasinoHero";
import CasinoOffers from "@/components/casino/CasinoOffers";
import CasinoSection from "@/components/casino/CasinoSection";
import CasinoSectionNav from "@/components/casino/CasinoSectionNav";
import { supabase } from "@/lib/supabase";

type CasinoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const sections = [
  [
    "offers",
    "Offers & Bonuses",
    "Current welcome offers, ongoing promotions and important terms.",
  ],
  [
    "payment-methods",
    "Purchase Methods",
    "Supported purchase methods, processing details and relevant limits.",
  ],
  [
    "redemption",
    "Redemption",
    "Prize redemption requirements, minimums and expected processing times.",
  ],
  [
    "states",
    "State Availability",
    "Where the casino is available and where access is restricted.",
  ],
  [
    "games",
    "Games & Providers",
    "Available game categories and software providers.",
  ],
  [
    "vip",
    "VIP",
    "Loyalty program structure, benefits and eligibility.",
  ],
  [
    "trust",
    "Trust",
    "Ownership, operating history, policies and verification signals.",
  ],
  [
    "alternatives",
    "Alternatives",
    "Comparable casinos for users who need a better fit.",
  ],
  [
    "review",
    "Full Review",
    "Detailed editorial review supported by structured casino data.",
  ],
  ["faq", "FAQ", "Common questions about this casino."],
] as const;

function formatAmount(value: number | string | null) {
  if (value === null) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export default async function CasinoPage({ params }: CasinoPageProps) {
  const { slug } = await params;

  const { data: casino, error: casinoError } = await supabase
    .from("casinos")
    .select(
      `
        id,
        name,
        slug,
        website_url,
        affiliate_url,
        logo_url,
        established_year,
        min_age,
        trust_score,
        last_verified_at,
        status
      `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (casinoError) {
    throw new Error(`Failed to load casino: ${casinoError.message}`);
  }

  if (!casino) {
    notFound();
  }

  const { data: casinoContent, error: casinoContentError } = await supabase
    .from("casino_content")
    .select(
      `
        verdict_label,
        verdict_summary,
        recommended_for,
        not_ideal_for
      `
    )
    .eq("casino_id", casino.id)
    .eq("section", "should_you_play")
    .maybeSingle();

  if (casinoContentError) {
    throw new Error(
      `Failed to load casino content: ${casinoContentError.message}`
    );
  }

  const { data: activeBonuses, error: activeBonusesError } = await supabase
    .from("bonuses")
    .select(
      `
        id,
        headline,
        description,
        purchase_amount,
        bonus_amount,
        sweeps_coins,
        promo_code,
        affiliate_url,
        is_featured,
        sort_order,
        last_verified_at
      `
    )
    .eq("casino_id", casino.id)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (activeBonusesError) {
    throw new Error(
      `Failed to load active bonuses: ${activeBonusesError.message}`
    );
  }

  const featuredBonus =
    activeBonuses?.find((bonus) => bonus.is_featured) ??
    activeBonuses?.[0] ??
    null;

  const {
    count: availableStatesCount,
    error: availableStatesError,
  } = await supabase
    .from("casino_states")
    .select("*", { count: "exact", head: true })
    .eq("casino_id", casino.id)
    .eq("availability", "available");

  if (availableStatesError) {
    throw new Error(
      `Failed to load state availability: ${availableStatesError.message}`
    );
  }

  const formattedGoldCoins = formatAmount(featuredBonus?.sweeps_coins ?? null);
  const formattedSweepsCoins = formatAmount(
    featuredBonus?.bonus_amount ?? null
  );

  const offerTitle = formattedGoldCoins
    ? `${formattedGoldCoins} Gold Coins`
    : featuredBonus?.headline ?? "No featured offer";

  const offerSubtitle = formattedSweepsCoins
    ? `+ ${formattedSweepsCoins} Stake Cash`
    : featuredBonus?.description ?? "Check the casino for current promotions.";

  const primaryUrl =
    featuredBonus?.affiliate_url ||
    casino.affiliate_url ||
    casino.website_url;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Link
          href="/sweepstakes-casinos"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          ← Back to casinos
        </Link>

        <CasinoHero
          name={casino.name}
          logoUrl={casino.logo_url}
          establishedYear={casino.established_year}
          minimumAge={casino.min_age}
          trustScore={casino.trust_score}
          lastVerified={casino.last_verified_at}
          primaryUrl={primaryUrl}
          verdict={casinoContent?.verdict_label ?? "Not Rated"}
          summary={
            casinoContent?.verdict_summary ??
            "This casino has not yet received a full WagerLayer verdict."
          }
          recommendedFor={casinoContent?.recommended_for ?? []}
          notIdealFor={casinoContent?.not_ideal_for ?? []}
          offerTitle={offerTitle}
          offerSubtitle={offerSubtitle}
          availableStates={availableStatesCount ?? 0}
          minimumRedemption="$50"
        />

        <CasinoSectionNav sections={sections} />

        <div className="mt-6 grid gap-6">
          {sections.map(([id, title, description]) => {
            if (id === "offers") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                >
                  <CasinoOffers
                    offers={activeBonuses ?? []}
                    fallbackUrl={casino.affiliate_url || casino.website_url}
                  />
                </CasinoSection>
              );
            }

            return (
              <CasinoSection
                key={id}
                id={id}
                title={title}
                description={description}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}