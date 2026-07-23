type State = {
  name: string;
  code: string;
  slug: string;
};

type CasinoState = {
  availability: "available" | "unavailable" | "restricted" | "unclear";
  last_verified_at: string | null;
  states: State[] | State | null;
};

type StateAvailabilityProps = {
  casinoStates: CasinoState[];
};

const groupConfig = {
  available: {
    title: "Available",
    description: "Players in these states can access the casino.",
  },
  restricted: {
    title: "Restricted",
    description: "Access may be limited or subject to additional conditions.",
  },
  unavailable: {
    title: "Unavailable",
    description: "The casino does not currently accept players from these states.",
  },
  unclear: {
    title: "Unclear",
    description: "Availability has not yet been fully verified.",
  },
} as const;

function getState(value: State[] | State | null): State | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function StateAvailability({
  casinoStates,
}: StateAvailabilityProps) {
  const groupedStates = casinoStates.reduce<
    Record<string, State[]>
  >((groups, casinoState) => {
    const state = getState(casinoState.states);

    if (!state) {
      return groups;
    }

    if (!groups[casinoState.availability]) {
      groups[casinoState.availability] = [];
    }

    groups[casinoState.availability].push(state);

    return groups;
  }, {});

  const visibleGroups = (
    ["available", "restricted", "unavailable", "unclear"] as const
  ).filter((availability) => groupedStates[availability]?.length);

  if (visibleGroups.length === 0) {
    return (
      <p className="text-sm leading-6 text-gray-600">
        State availability has not yet been verified.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {visibleGroups.map((availability) => {
        const config = groupConfig[availability];
        const states = groupedStates[availability].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        return (
          <div key={availability}>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-950">
                {config.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                {config.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {states.map((state) => (
                <div
                  key={state.code}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-gray-950">
                    {state.code}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {state.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}