"use client";

export default function LanguageTabs({
  activeTab = "om",
  onTabChange,
  title = "",
  label = "Language:",
}) {
  return (
    <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {title ? (
        <h2 className="text-base font-bold text-[#070707]">{title}</h2>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        <label htmlFor="lang-select" className="text-xs font-bold text-[#070707]">
          {label}
        </label>
        <div className="relative">
          <select
            id="lang-select"
            value={activeTab}
            onChange={(e) => onTabChange && onTabChange(e.target.value)}
            className="appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 py-1.5 text-xs font-bold text-[#070707] shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="om">Afaan Oromo</option>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}


