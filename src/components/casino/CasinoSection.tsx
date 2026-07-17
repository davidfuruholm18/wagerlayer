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