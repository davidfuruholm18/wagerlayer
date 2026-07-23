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
  sweepsCurrencyName: string;
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
  sweepsCurrencyName,
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
                      {stakeCash} Sweeps Coins
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