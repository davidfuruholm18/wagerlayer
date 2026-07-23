type PaymentMethod = {
  name: string;
  slug: string;
  category: string;
  logo_url: string | null;
};

type PaymentMethodDetails = {
  supports_purchase: boolean;
  supports_redemption: boolean;
  minimum_purchase: number | null;
  maximum_purchase: number | null;
  minimum_redemption: number | null;
  processing_time: string | null;
  fees: string | null;
  notes: string | null;
  last_verified_at: string | null;
  payment_methods: PaymentMethod[] | PaymentMethod | null;
};

type PaymentMethodsProps = {
  methods: PaymentMethodDetails[];
  mode: "purchase" | "redemption";
};

const categoryLabels: Record<string, string> = {
  card: "Credit & Debit Cards",
  bank: "Bank Transfers",
  crypto: "Cryptocurrency",
  ewallet: "E-Wallets",
  other: "Other Methods",
};

function getPaymentMethod(
  value: PaymentMethod[] | PaymentMethod | null
): PaymentMethod | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PaymentMethods({
  methods,
  mode,
}: PaymentMethodsProps) {
  const relevantMethods = methods.filter((method) =>
    mode === "purchase"
      ? method.supports_purchase
      : method.supports_redemption
  );

  if (relevantMethods.length === 0) {
    return (
      <p className="text-sm leading-6 text-gray-600">
        No verified {mode} methods are currently available.
      </p>
    );
  }

  const groupedMethods = relevantMethods.reduce<
    Record<string, PaymentMethodDetails[]>
  >((groups, method) => {
    const paymentMethod = getPaymentMethod(method.payment_methods);
    const category = paymentMethod?.category ?? "other";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(method);

    return groups;
  }, {});

  return (
    <div className="max-w-3xl space-y-8">
      {Object.entries(groupedMethods).map(([category, categoryMethods]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {categoryLabels[category] ?? categoryLabels.other}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {categoryMethods.map((method) => {
              const paymentMethod = getPaymentMethod(method.payment_methods);

              if (!paymentMethod) {
                return null;
              }

              const minimum =
                mode === "purchase"
                  ? method.minimum_purchase
                  : method.minimum_redemption;

              const maximum =
                mode === "purchase" ? method.maximum_purchase : null;

              return (
                <article
                  key={paymentMethod.slug}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    {paymentMethod.logo_url ? (
                      <img
                        src={paymentMethod.logo_url}
                        alt=""
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
                        {paymentMethod.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-950">
                        {paymentMethod.name}
                      </h4>

                      {method.processing_time && (
                        <p className="mt-1 text-sm text-gray-600">
                          {method.processing_time}
                        </p>
                      )}
                    </div>
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    {minimum !== null && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Minimum {mode}</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(minimum)}
                        </dd>
                      </div>
                    )}

                    {maximum !== null && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Maximum purchase</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(maximum)}
                        </dd>
                      </div>
                    )}

                    {method.fees && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Fees</dt>
                        <dd className="text-right font-medium text-gray-900">
                          {method.fees}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {method.notes && (
                    <p className="mt-4 border-t border-gray-100 pt-4 text-sm leading-6 text-gray-600">
                      {method.notes}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}