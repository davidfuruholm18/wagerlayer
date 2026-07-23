type Provider = {
  name: string;
  slug: string;
};

type CasinoProvider = {
  is_featured: boolean;
  provider: Provider[] | Provider | null;
};

type GameProvidersProps = {
  providers: CasinoProvider[];
};

function getProvider(
  value: Provider[] | Provider | null
): Provider | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function GameProviders({
  providers,
}: GameProvidersProps) {
  if (providers.length === 0) {
    return (
      <p className="text-sm leading-6 text-gray-600">
        Game providers have not yet been verified.
      </p>
    );
  }

  const featured = providers.filter((provider) => provider.is_featured);
  const other = providers.filter((provider) => !provider.is_featured);

  function renderGroup(
    title: string,
    items: CasinoProvider[]
  ) {
    if (items.length === 0) {
      return null;
    }

    return (
      <div>
        <h3 className="mb-4 text-base font-semibold text-gray-950">
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const provider = getProvider(item.provider);

            if (!provider) {
              return null;
            }

            return (
              <div
                key={provider.slug}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <p className="font-medium text-gray-900">
                  {provider.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderGroup("Featured Providers", featured)}
      {renderGroup("More Providers", other)}
    </div>
  );
}