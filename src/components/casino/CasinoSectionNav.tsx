type CasinoSectionNavProps = {
  sections: readonly (readonly [string, string, string])[];
};

export default function CasinoSectionNav({
  sections,
}: CasinoSectionNavProps) {
  return (
    <nav className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex min-w-max gap-5">
        {sections.map(([id, title]) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-950"
          >
            {title}
          </a>
        ))}
      </div>
    </nav>
  );
}