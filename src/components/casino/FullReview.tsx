type FullReviewProps = {
  introduction: string | null;
  experience: string | null;
  gamesOverview: string | null;
  bonusesOverview: string | null;
  purchaseRedemptionOverview: string | null;
  trustOverview: string | null;
  finalVerdict: string | null;
  pros: string[];
  cons: string[];
};

type ReviewSectionProps = {
  title: string;
  content: string | null;
};

function ReviewSection({ title, content }: ReviewSectionProps) {
  if (!content) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="leading-7 text-gray-700">{content}</p>
    </div>
  );
}

export default function FullReview({
  introduction,
  experience,
  gamesOverview,
  bonusesOverview,
  purchaseRedemptionOverview,
  trustOverview,
  finalVerdict,
  pros,
  cons,
}: FullReviewProps) {
  const hasContent =
    introduction ||
    experience ||
    gamesOverview ||
    bonusesOverview ||
    purchaseRedemptionOverview ||
    trustOverview ||
    finalVerdict ||
    pros.length > 0 ||
    cons.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-8">
      {introduction && (
        <p className="text-lg leading-8 text-gray-700">{introduction}</p>
      )}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {pros.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="mb-4 text-lg font-semibold text-green-900">
                Pros
              </h3>

              <ul className="space-y-3">
                {pros.map((pro) => (
                  <li
                    key={pro}
                    className="flex gap-3 text-sm leading-6 text-green-900"
                  >
                    <span aria-hidden="true">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-4 text-lg font-semibold text-red-900">
                Cons
              </h3>

              <ul className="space-y-3">
                {cons.map((con) => (
                  <li
                    key={con}
                    className="flex gap-3 text-sm leading-6 text-red-900"
                  >
                    <span aria-hidden="true">−</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ReviewSection title="User Experience" content={experience} />

      <ReviewSection title="Games" content={gamesOverview} />

      <ReviewSection title="Bonuses" content={bonusesOverview} />

      <ReviewSection
        title="Purchases and Redemptions"
        content={purchaseRedemptionOverview}
      />

      <ReviewSection title="Trust and Reputation" content={trustOverview} />

      <ReviewSection title="Final Verdict" content={finalVerdict} />
    </div>
  );
}