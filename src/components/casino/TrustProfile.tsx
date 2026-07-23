type TrustProfileData = {
  summary: string | null;
  ownership_notes: string | null;
  account_security: string | null;
  identity_verification: string | null;
  responsible_play: string | null;
  terms_transparency: string | null;
  positive_signals: string[] | null;
  watch_items: string[] | null;
};

type TrustProfileProps = {
  trustProfile: TrustProfileData | null;
};

type DetailItemProps = {
  title: string;
  content: string | null;
};

function DetailItem({ title, content }: DetailItemProps) {
  if (!content) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-gray-600">{content}</p>
    </div>
  );
}

export default function TrustProfile({
  trustProfile,
}: TrustProfileProps) {
  if (!trustProfile) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        Trust information has not yet been verified.
      </div>
    );
  }

  const positiveSignals = trustProfile.positive_signals ?? [];
  const watchItems = trustProfile.watch_items ?? [];

  return (
    <div className="space-y-6">
      {trustProfile.summary ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <p className="max-w-3xl text-sm leading-7 text-gray-700">
            {trustProfile.summary}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <DetailItem
          title="Ownership and operation"
          content={trustProfile.ownership_notes}
        />

        <DetailItem
          title="Account security"
          content={trustProfile.account_security}
        />

        <DetailItem
          title="Identity verification"
          content={trustProfile.identity_verification}
        />

        <DetailItem
          title="Responsible play"
          content={trustProfile.responsible_play}
        />

        <DetailItem
          title="Terms transparency"
          content={trustProfile.terms_transparency}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {positiveSignals.length > 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-950">
              Positive signals
            </h3>

            <ul className="mt-4 space-y-3">
              {positiveSignals.map((signal) => (
                <li
                  key={signal}
                  className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                >
                  <span className="mt-0.5 font-bold text-gray-950">✓</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {watchItems.length > 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-950">
              Things to consider
            </h3>

            <ul className="mt-4 space-y-3">
              {watchItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                >
                  <span className="mt-0.5 font-bold text-gray-950">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}