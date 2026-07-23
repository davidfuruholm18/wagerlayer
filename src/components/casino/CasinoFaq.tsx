export type CasinoFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type CasinoFaqProps = {
  items: CasinoFaqItem[];
};

export default function CasinoFaq({ items }: CasinoFaqProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-gray-600">
        No verified FAQs are available yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {items.map((item) => (
        <details key={item.id} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-950">
            <span>{item.question}</span>

            <span
              aria-hidden="true"
              className="text-xl leading-none text-gray-500 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>

          <p className="mt-3 pr-8 text-sm leading-7 text-gray-700">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}