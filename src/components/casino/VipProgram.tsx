type VipProgramData = {
  program_name: string | null;
  summary: string | null;
  has_vip_program: boolean;
  is_public: boolean;
  tier_count: number | null;
  eligibility: string | null;
  benefits: string[] | null;
  notes: string | null;
};

type VipProgramProps = {
  vipProgram: VipProgramData | null;
};

export default function VipProgram({ vipProgram }: VipProgramProps) {
  if (!vipProgram) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        VIP program information has not yet been verified.
      </div>
    );
  }

  if (!vipProgram.has_vip_program) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        This casino does not currently offer a verified VIP program.
      </div>
    );
  }

  const benefits = vipProgram.benefits ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {vipProgram.program_name ? (
            <h3 className="text-xl font-bold text-gray-950">
              {vipProgram.program_name}
            </h3>
          ) : null}

          {vipProgram.summary ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              {vipProgram.summary}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {vipProgram.is_public ? "Public program" : "Invite-only"}
          </span>

          {vipProgram.tier_count !== null ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {vipProgram.tier_count} tiers
            </span>
          ) : null}
        </div>
      </div>

      {vipProgram.eligibility ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Eligibility
          </h4>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            {vipProgram.eligibility}
          </p>
        </div>
      ) : null}

      {benefits.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Benefits
          </h4>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm leading-6 text-gray-700"
              >
                <span className="mt-0.5 font-bold text-gray-950">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {vipProgram.notes ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs leading-5 text-gray-600">{vipProgram.notes}</p>
        </div>
      ) : null}
    </div>
  );
}