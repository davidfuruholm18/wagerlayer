import Link from "next/link";
import { notFound } from "next/navigation";

import CasinoAlternatives from "@/components/casino/CasinoAlternatives";
import CasinoFaq from "@/components/casino/CasinoFaq";
import CasinoHero from "@/components/casino/CasinoHero";
import CasinoOffers from "@/components/casino/CasinoOffers";
import CasinoSection from "@/components/casino/CasinoSection";
import CasinoSectionNav from "@/components/casino/CasinoSectionNav";
import FullReview from "@/components/casino/FullReview";
import GameProviders from "@/components/casino/GameProviders";
import PaymentMethods from "@/components/casino/PaymentMethods";
import StateAvailability from "@/components/casino/StateAvailability";
import TrustProfile from "@/components/casino/TrustProfile";
import VipProgram from "@/components/casino/VipProgram";
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

function getLatestVerifiedDate(
  dates: Array<string | null | undefined>
): string | null {
  return (
    dates
      .filter((date): date is string => Boolean(date))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null
  );
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
        reward_currency_name,
        website_url,
        affiliate_url,
        logo_url,
        established_year,
        min_age,
        trust_score,
        last_verified_at,
        status,
        operator:operators (
          name
        )
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

  const casinoRecord = casino;

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
    .eq("casino_id", casinoRecord.id)
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
    .eq("casino_id", casinoRecord.id)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (activeBonusesError) {
    throw new Error(
      `Failed to load active bonuses: ${activeBonusesError.message}`
    );
  }

  const { data: paymentMethods, error: paymentMethodsError } = await supabase
    .from("casino_payment_methods")
    .select(
      `
        supports_purchase,
        supports_redemption,
        minimum_purchase,
        maximum_purchase,
        minimum_redemption,
        processing_time,
        fees,
        notes,
        last_verified_at,
        payment_methods (
          name,
          slug,
          category,
          logo_url
        )
      `
    )
    .eq("casino_id", casinoRecord.id)
    .order("created_at", { ascending: true });

  if (paymentMethodsError) {
    throw new Error(
      `Failed to load payment methods: ${paymentMethodsError.message}`
    );
  }

  const { data: casinoStates, error: casinoStatesError } = await supabase
    .from("casino_states")
    .select(
      `
        availability,
        last_verified_at,
        states (
          name,
          code,
          slug
        )
      `
    )
    .eq("casino_id", casinoRecord.id);

  if (casinoStatesError) {
    throw new Error(
      `Failed to load casino state availability: ${casinoStatesError.message}`
    );
  }

  const { data: casinoProviders, error: casinoProvidersError } = await supabase
    .from("casino_providers")
    .select(
      `
        is_featured,
        last_verified_at,
        provider:game_providers (
          name,
          slug
        )
      `
    )
    .eq("casino_id", casinoRecord.id)
    .order("is_featured", { ascending: false });

  if (casinoProvidersError) {
    throw new Error(
      `Failed to load game providers: ${casinoProvidersError.message}`
    );
  }

  const { data: vipProgram, error: vipProgramError } = await supabase
    .from("casino_vip_programs")
    .select(
      `
        program_name,
        summary,
        has_vip_program,
        is_public,
        tier_count,
        eligibility,
        benefits,
        notes,
        last_verified_at
      `
    )
    .eq("casino_id", casinoRecord.id)
    .maybeSingle();

  if (vipProgramError) {
    throw new Error(`Failed to load VIP program: ${vipProgramError.message}`);
  }

  const { data: trustProfile, error: trustProfileError } = await supabase
    .from("casino_trust_profiles")
    .select(
      `
        summary,
        ownership_notes,
        account_security,
        identity_verification,
        responsible_play,
        terms_transparency,
        positive_signals,
        watch_items,
        last_verified_at
      `
    )
    .eq("casino_id", casinoRecord.id)
    .maybeSingle();

  if (trustProfileError) {
    throw new Error(
      `Failed to load trust profile: ${trustProfileError.message}`
    );
  }

  const {
    data: alternativeRelationships,
    error: alternativeRelationshipsError,
  } = await supabase
    .from("casino_alternatives")
    .select(
      `
        alternative_casino_id,
        position,
        last_verified_at
      `
    )
    .eq("casino_id", casinoRecord.id)
    .order("position", { ascending: true });

  if (alternativeRelationshipsError) {
    throw new Error(
      `Failed to load casino alternatives: ${alternativeRelationshipsError.message}`
    );
  }

  const { data: fullReview, error: fullReviewError } = await supabase
    .from("casino_reviews")
    .select(
      `
        introduction,
        experience,
        games_overview,
        bonuses_overview,
        purchase_redemption_overview,
        trust_overview,
        final_verdict,
        pros,
        cons,
        last_verified_at
      `
    )
    .eq("casino_id", casinoRecord.id)
    .maybeSingle();

  if (fullReviewError) {
    throw new Error(
      `Failed to load full review: ${fullReviewError.message}`
    );
  }

  const { data: faqRows, error: faqRowsError } = await supabase
    .from("casino_faqs")
    .select(
      `
        id,
        question,
        answer_type,
        answer_key,
        manual_answer,
        sort_order,
        last_verified_at
      `
    )
    .eq("casino_id", casinoRecord.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (faqRowsError) {
    throw new Error(`Failed to load casino FAQs: ${faqRowsError.message}`);
  }
  const alternativeIds =
    alternativeRelationships?.map(
      (relationship) => relationship.alternative_casino_id
    ) ?? [];

  let alternatives: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    trust_score: number | null;
  }> = [];

  if (alternativeIds.length > 0) {
    const { data: alternativeCasinos, error: alternativeCasinosError } =
      await supabase
        .from("casinos")
        .select(
          `
            id,
            name,
            slug,
            logo_url,
            trust_score
          `
        )
        .in("id", alternativeIds)
        .eq("status", "active");

    if (alternativeCasinosError) {
      throw new Error(
        `Failed to load alternative casino details: ${alternativeCasinosError.message}`
      );
    }

    const casinoById = new Map(
      (alternativeCasinos ?? []).map((alternativeCasino) => [
        alternativeCasino.id,
        alternativeCasino,
      ])
    );

    alternatives = alternativeIds
      .map((alternativeId) => casinoById.get(alternativeId))
      .filter(
        (
          alternativeCasino
        ): alternativeCasino is {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          trust_score: number | null;
        } => Boolean(alternativeCasino)
      );
  }

  const featuredBonus =
    activeBonuses?.find((bonus) => bonus.is_featured) ??
    activeBonuses?.[0] ??
    null;

  const getRelatedRecord = <T,>(
    value: T | T[] | null | undefined
  ): T | null => {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  };

  const operatorName =
    getRelatedRecord(casinoRecord.operator)?.name ?? "the listed operator";

  const purchaseMethodNames = Array.from(
    new Set(
      (paymentMethods ?? [])
        .filter((method) => method.supports_purchase)
        .map((method) => getRelatedRecord(method.payment_methods)?.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  const redemptionMethodNames = Array.from(
    new Set(
      (paymentMethods ?? [])
        .filter((method) => method.supports_redemption)
        .map((method) => getRelatedRecord(method.payment_methods)?.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  const availableStateNames = (casinoStates ?? [])
    .filter((casinoState) => casinoState.availability === "available")
    .map((casinoState) => getRelatedRecord(casinoState.states)?.name)
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));

  const restrictedStateNames = (casinoStates ?? [])
    .filter((casinoState) =>
      ["unavailable", "restricted"].includes(casinoState.availability)
    )
    .map((casinoState) => getRelatedRecord(casinoState.states)?.name)
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));

  const minimumRedemptionValues = (paymentMethods ?? [])
    .filter((method) => method.supports_redemption)
    .map((method) => Number(method.minimum_redemption))
    .filter((value) => Number.isFinite(value));

  const minimumRedemption =
    minimumRedemptionValues.length > 0
      ? Math.min(...minimumRedemptionValues)
      : null;

  function joinList(items: string[]) {
    if (items.length === 0) {
      return "";
    }

    if (items.length === 1) {
      return items[0];
    }

    return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
  }

  function getStructuredFaqAnswer(answerKey: string | null) {
    switch (answerKey) {
      case "minimum_age":
        return casinoRecord.min_age
          ? `Players must be at least ${casinoRecord.min_age} years old to use ${casinoRecord.name}.`
          : `The minimum age for ${casinoRecord.name} has not yet been verified.`;

      case "available_states":
        return availableStateNames.length > 0
          ? `${casinoRecord.name} is currently marked as available in ${availableStateNames.length} states: ${joinList(
              availableStateNames
            )}. Availability can change, so check the current terms before registering.`
          : `No states are currently marked as verified available for ${casinoRecord.name}.`;

      case "restricted_states":
        return restrictedStateNames.length > 0
          ? `${casinoRecord.name} is currently marked as restricted or unavailable in ${restrictedStateNames.length} states: ${joinList(
              restrictedStateNames
            )}.`
          : `No restricted states are currently listed for ${casinoRecord.name}.`;

      case "purchase_methods":
        return purchaseMethodNames.length > 0
          ? `${casinoRecord.name} currently supports purchases through ${joinList(
              purchaseMethodNames
            )}. Available methods may vary by account and location.`
          : `No verified purchase methods are currently listed for ${casinoRecord.name}.`;

      case "redemption_methods":
        return redemptionMethodNames.length > 0
          ? `Verified redemption methods for ${casinoRecord.name} include ${joinList(
              redemptionMethodNames
            )}. Processing times and limits depend on the selected method.`
          : `No verified redemption methods are currently listed for ${casinoRecord.name}.`;

      case "minimum_redemption":
        return minimumRedemption !== null
          ? `The lowest verified redemption minimum for ${casinoRecord.name} is $${formatAmount(
              minimumRedemption
            )}. The exact minimum can depend on the redemption method.`
          : `The minimum redemption for ${casinoRecord.name} has not yet been verified.`;

      case "operator":
        return `${casinoRecord.name} is operated by ${operatorName}.`;

      case "current_bonus":
        return featuredBonus
          ? `${casinoRecord.name}'s current featured offer is ${
              featuredBonus.headline || "a featured promotion"
            }. ${
              featuredBonus.description
                ? featuredBonus.description
                : "Review the current terms before claiming the offer."
            }`
          : `${casinoRecord.name} does not currently have a verified featured offer listed.`;

      default:
        return null;
    }
  }

  const faqItems =
    faqRows
      ?.map((faq) => {
        const answer =
          faq.answer_type === "manual"
            ? faq.manual_answer
            : getStructuredFaqAnswer(faq.answer_key);

        if (!answer) {
          return null;
        }

        return {
          id: faq.id,
          question: faq.question,
          answer,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          question: string;
          answer: string;
        } => Boolean(item)
      ) ?? [];

  const faqLastVerified = getLatestVerifiedDate(
    faqRows?.map((faq) => faq.last_verified_at) ?? []
  );


  const availableStatesCount =
    casinoStates?.filter(
      (casinoState) => casinoState.availability === "available"
    ).length ?? 0;

  const paymentMethodsLastVerified = getLatestVerifiedDate(
    paymentMethods?.map((method) => method.last_verified_at) ?? []
  );

  const statesLastVerified = getLatestVerifiedDate(
    casinoStates?.map((casinoState) => casinoState.last_verified_at) ?? []
  );

  const providersLastVerified = getLatestVerifiedDate(
    casinoProviders?.map(
      (casinoProvider) => casinoProvider.last_verified_at
    ) ?? []
  );

  const alternativesLastVerified = getLatestVerifiedDate(
    alternativeRelationships?.map(
      (relationship) => relationship.last_verified_at
    ) ?? []
  );

  const formattedGoldCoins = formatAmount(featuredBonus?.sweeps_coins ?? null);
  const formattedSweepsCoins = formatAmount(
    featuredBonus?.bonus_amount ?? null
  );

  const offerTitle = formattedGoldCoins
    ? `${formattedGoldCoins} Gold Coins`
    : featuredBonus?.headline ?? "No featured offer";

const offerSubtitle = formattedSweepsCoins
  ? `+ ${formattedSweepsCoins} ${
      casinoRecord.reward_currency_name ?? "Sweeps Coins"
    }`
    : featuredBonus?.description ??
      "Check the casino for current promotions.";

  const primaryUrl =
    featuredBonus?.affiliate_url ||
    casinoRecord.affiliate_url ||
    casinoRecord.website_url;

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
          name={casinoRecord.name}
          logoUrl={casinoRecord.logo_url}
          establishedYear={casinoRecord.established_year}
          minimumAge={casinoRecord.min_age}
          trustScore={casinoRecord.trust_score}
          lastVerified={casinoRecord.last_verified_at}
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
          availableStates={availableStatesCount}
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
  fallbackUrl={casinoRecord.affiliate_url || casinoRecord.website_url}
  sweepsCurrencyName={
    casinoRecord.reward_currency_name ?? "Sweeps Coins"
  }
/>
                </CasinoSection>
              );
            }

            if (id === "payment-methods") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={paymentMethodsLastVerified}
                >
                  <PaymentMethods
                    methods={paymentMethods ?? []}
                    mode="purchase"
                  />
                </CasinoSection>
              );
            }

            if (id === "redemption") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={paymentMethodsLastVerified}
                >
                  <PaymentMethods
                    methods={paymentMethods ?? []}
                    mode="redemption"
                  />
                </CasinoSection>
              );
            }

            if (id === "states") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={statesLastVerified}
                >
                  <StateAvailability casinoStates={casinoStates ?? []} />
                </CasinoSection>
              );
            }

            if (id === "games") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={providersLastVerified}
                >
                  <GameProviders providers={casinoProviders ?? []} />
                </CasinoSection>
              );
            }

            if (id === "vip") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={vipProgram?.last_verified_at ?? null}
                >
                  <VipProgram vipProgram={vipProgram} />
                </CasinoSection>
              );
            }

            if (id === "trust") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={trustProfile?.last_verified_at ?? null}
                >
                  <TrustProfile trustProfile={trustProfile} />
                </CasinoSection>
              );
            }

            if (id === "alternatives") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={alternativesLastVerified}
                >
                  <CasinoAlternatives alternatives={alternatives} />
                </CasinoSection>
              );
            }

            if (id === "review") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={fullReview?.last_verified_at ?? null}
                >
                  <FullReview
                    introduction={fullReview?.introduction ?? null}
                    experience={fullReview?.experience ?? null}
                    gamesOverview={fullReview?.games_overview ?? null}
                    bonusesOverview={fullReview?.bonuses_overview ?? null}
                    purchaseRedemptionOverview={
                      fullReview?.purchase_redemption_overview ?? null
                    }
                    trustOverview={fullReview?.trust_overview ?? null}
                    finalVerdict={fullReview?.final_verdict ?? null}
                    pros={fullReview?.pros ?? []}
                    cons={fullReview?.cons ?? []}
                  />
                </CasinoSection>
              );
            }

            if (id === "faq") {
              return (
                <CasinoSection
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  lastVerified={faqLastVerified}
                >
                  <CasinoFaq items={faqItems} />
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