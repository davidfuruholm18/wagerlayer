# WagerLayer — Canonical Project Context

Last updated: 2026-07-17

This file is the handoff source for ChatGPT, Claude, or any other assistant working on WagerLayer.

Use this before asking the founder to paste code again.

---

## 1. Product Mission

WagerLayer is a database-driven sweepstakes casino comparison platform.

It is not an affiliate blog.

Primary goal:

- Help users choose the best sweepstakes casino quickly.
- Monetize through affiliate links.
- Store every fact once in the database.
- Update once and display everywhere.
- Prioritize mobile UX, SEO, and affiliate conversion.
- Avoid overengineering.

---

## 2. Locked Product Decisions

### Main navigation

- Casinos
- Compare
- Bonuses
- States
- Learn

No News section.

Providers are filters, not a main navigation item.

### Homepage

- Search
- Top Casinos
- Compare Casinos
- Browse by State
- Browse by Feature
- Latest Verified Changes
- Guides

No article feed.

### Casino page order

1. Hero
2. Should You Play Here?
3. Offers & Bonuses
4. Purchase Methods
5. Redemption
6. State Availability
7. Games & Providers
8. VIP
9. Trust
10. Alternatives
11. Full Review
12. FAQ

### MVP exclusions

- User accounts
- User reviews
- Community
- News
- AI summaries
- Scraping
- Chrome extension
- Public API
- Mobile app
- Alerts
- Redemption reports

---

## 3. Current Stack

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- ESLint
- `src` directory
- Supabase
- GitHub
- Vercel

Local project path:

```text
C:\Users\david\Projects\wagerlayer
```

GitHub repository:

```text
https://github.com/davidfuruholm18/wagerlayer
```

Main branch:

```text
main
```

---

## 4. Current File Structure

Implemented files:

```text
src/
  app/
    page.tsx
    sweepstakes-casinos/
      page.tsx
      [slug]/
        page.tsx

  components/
    CasinoCard.tsx
    casino/
      CasinoHero.tsx
      CasinoOffers.tsx
      CasinoSection.tsx
      CasinoSectionNav.tsx
      TrustBadge.tsx

  lib/
    supabase.ts

supabase/
  .gitignore
  config.toml
  migrations/
    20260716114033_create_core_tables.sql
```

---

## 5. Approved Database Tables

The approved schema includes:

- `operators`
- `casinos`
- `states`
- `casino_states`
- `bonuses`
- `payment_methods`
- `casino_payment_methods`
- `game_providers`
- `casino_providers`
- `articles`
- `casino_content`

Comparisons are generated dynamically.

There is no comparison table.

---

## 6. Known Table Structure

This section contains only fields confirmed during development.

### `operators`

Confirmed fields:

```text
id
name
slug
website_url
created_at
updated_at
```

### `casinos`

Confirmed fields:

```text
id
operator_id
name
slug
website_url
affiliate_url
logo_url
established_year
min_age
trust_score
featured
status
last_verified_at
created_at
updated_at
```

### `states`

Confirmed fields:

```text
id
name
code
slug
status
legal_summary
last_verified_at
created_at
updated_at
```

Important:

- The table uses `code`, not `abbreviation`.
- There is no confirmed `country_code` column.

### `casino_states`

Confirmed fields used by the application:

```text
casino_id
state_id
availability
```

Confirmed availability values:

```text
available
unavailable
restricted
unclear
```

Confirmed primary key behavior:

```text
(casino_id, state_id)
```

The table has RLS enabled.

Public read policy created:

```sql
create policy "Public can read casino states"
on public.casino_states
for select
to anon, authenticated
using (true);
```

### `bonuses`

Confirmed fields used by the application:

```text
id
casino_id
headline
description
type
purchase_amount
bonus_amount
sweeps_coins
promo_code
affiliate_url
is_featured
sort_order
status
last_verified_at
```

Confirmed `type` constraint values at the time of setup:

```text
welcome
purchase
daily
promo
no_purchase_required
other
```

Do not assume values such as `mail_in` or `referral` exist until the constraint is intentionally updated.

### `casino_content`

Confirmed fields used by the application:

```text
id
casino_id
section
verdict_label
verdict_summary
recommended_for
not_ideal_for
created_at
updated_at
```

Confirmed current section value used for the hero verdict:

```text
should_you_play
```

An earlier insert using `hero` failed because it violated the section check constraint.

### Other tables

The following exist, but their exact columns should be read from the migration before editing:

- `payment_methods`
- `casino_payment_methods`
- `game_providers`
- `casino_providers`
- `articles`

---

## 7. Seeded Data

### Operator

```text
Name: Sweepsteaks Limited
Slug: sweepsteaks-limited
```

### Casino

```text
Name: Stake.us
Slug: stake-us
Website: https://stake.us
Established year: 2017
Minimum age: 21
Status: active
Featured: true
```

The logo URL is stored in Supabase and renders successfully.

Trust score is configured so the UI shows:

```text
Highly Trusted
```

### Stake.us verdict content

Stored in `casino_content`.

Current section:

```text
should_you_play
```

Confirmed fields in use:

- verdict label
- verdict summary
- recommended-for list
- not-ideal-for list

### Stake.us featured bonus

Current featured offer:

```text
Headline: No Deposit Welcome Bonus
Gold Coins: 250,000
Stake Cash: 25
Type: no_purchase_required
Status: active
Featured: true
```

The hero and lower Offers & Bonuses section both read from this row.

### State availability

All 50 U.S. states were seeded.

Stake.us availability currently totals:

```text
Available: 29
Unavailable: 21
```

The hero displays:

```text
29 states
```

This count is database-driven.

---

## 8. Current Casino Page Implementation

Main file:

```text
src/app/sweepstakes-casinos/[slug]/page.tsx
```

Current behavior:

1. Reads the casino by slug.
2. Requires `status = active`.
3. Reads `casino_content` for `section = should_you_play`.
4. Reads all active bonuses.
5. Chooses the featured bonus for the hero.
6. Counts available states.
7. Renders the database-driven hero.
8. Renders all active bonuses in the Offers & Bonuses section.
9. Leaves later sections as placeholders.

### Current page code

```tsx
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
```

---

## 9. CasinoOffers Component

File:

```text
src/components/casino/CasinoOffers.tsx
```

Current role:

- Receives all active bonuses.
- Displays multiple bonus cards.
- Formats Gold Coins, Stake Cash, purchase amount, promo code, and last verified date.
- Uses the bonus affiliate URL first.
- Falls back to the casino affiliate URL or website URL.
- Supports empty states.

### Current code

```tsx
type CasinoOffer = {
  id: string;
  headline: string;
  description: string | null;
  purchase_amount: number | string | null;
  bonus_amount: number | string | null;
  sweeps_coins: number | string | null;
  promo_code: string | null;
  affiliate_url: string | null;
  last_verified_at: string | null;
};

type CasinoOffersProps = {
  offers: CasinoOffer[];
  fallbackUrl: string | null;
};

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

function formatCurrency(value: number | string | null) {
  if (value === null) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not verified";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CasinoOffers({
  offers,
  fallbackUrl,
}: CasinoOffersProps) {
  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        No active offers are currently listed.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {offers.map((offer) => {
        const goldCoins = formatAmount(offer.sweeps_coins);
        const stakeCash = formatAmount(offer.bonus_amount);
        const purchaseAmount = formatCurrency(offer.purchase_amount);
        const offerUrl = offer.affiliate_url || fallbackUrl;

        return (
          <article
            key={offer.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-950">
                  {offer.headline}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {goldCoins ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                      {goldCoins} Gold Coins
                    </span>
                  ) : null}

                  {stakeCash ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      {stakeCash} Stake Cash
                    </span>
                  ) : null}

                  {purchaseAmount ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                      Purchase: {purchaseAmount}
                    </span>
                  ) : null}
                </div>

                {offer.description ? (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                    {offer.description}
                  </p>
                ) : null}

                {offer.promo_code ? (
                  <p className="mt-4 text-sm text-gray-700">
                    Promo code:{" "}
                    <span className="font-semibold text-gray-950">
                      {offer.promo_code}
                    </span>
                  </p>
                ) : null}

                <p className="mt-4 text-xs text-gray-500">
                  Last verified: {formatDate(offer.last_verified_at)}
                </p>
              </div>

              {offerUrl ? (
                <a
                  href={offerUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-amber-400"
                >
                  Claim Offer
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
```

---

## 10. CasinoSection Component

File:

```text
src/components/casino/CasinoSection.tsx
```

Current role:

- Wraps each casino page section.
- Accepts optional children.
- Shows a placeholder when no child content exists.

### Current code

```tsx
import type { ReactNode } from "react";

type CasinoSectionProps = {
  id: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function CasinoSection({
  id,
  title,
  description,
  children,
}: CasinoSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
    >
      <h2 className="text-2xl font-bold tracking-tight text-gray-950">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        {description}
      </p>

      <div className="mt-6">
        {children ?? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
            This section will be connected to the database in a later ticket.
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## 11. Current Hero State

The hero is database-driven for:

- Casino name
- Logo
- Established year
- Minimum age
- Trust score
- Last verified date
- Verdict label
- Verdict summary
- Recommended for
- Not ideal for
- Featured offer
- Available state count
- Primary affiliate URL

Still hardcoded:

```text
minimumRedemption="$50"
```

This should be replaced when the Redemption section is implemented.

---

## 12. Current Affiliate URL Fallback Logic

For the hero:

```text
featured bonus affiliate URL
→ casino affiliate URL
→ casino website URL
```

For bonus cards:

```text
individual bonus affiliate URL
→ casino affiliate URL
→ casino website URL
```

This behavior is intentional.

---

## 13. Current Git Checkpoint

Latest confirmed commit:

```text
564224f
```

Commit message:

```text
Add dynamic offers and bonuses section
```

Push succeeded to:

```text
main
```

The LF-to-CRLF warnings shown by Git on Windows are normal and not errors.

---

## 14. Current Development Status

Completed:

- Project setup
- Supabase connection
- Core migration
- Casino directory
- Casino card
- Dynamic individual casino route
- Database-driven hero
- Database-driven verdict
- Featured bonus in hero
- Multiple active bonuses in Offers & Bonuses
- State availability count
- Git checkpoint

Current next task:

```text
Purchase Methods
```

Do not polish the bonus UI further yet.

The existing implementation is sufficient to validate the data model.

---

## 15. Rules for Future Assistants

1. Read this file before asking for code.
2. Read the migration before assuming a column exists.
3. Give complete replacement files rather than fragile partial edits when possible.
4. Work one ticket at a time.
5. Do not jump ahead.
6. Do not overbuild.
7. Database first.
8. Store each fact once.
9. Prefer real structured data over hardcoded text.
10. Prioritize affiliate conversion and mobile usability.
11. Keep explanations direct and brief.
12. Update this file after each meaningful completed ticket.

---

## 16. Important Limitation

This file contains the exact code and schema details confirmed in the conversation.

It does not replace the migration file as the final source of truth for every column.

Before changing tables, inspect:

```text
supabase/migrations/20260716114033_create_core_tables.sql
```

That migration remains the authoritative schema definition.
