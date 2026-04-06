'use client';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

export default function TopHeader({
  title = 'Dashboard',
  subtitle,
  searchPlaceholder = 'Search accounts, deals, or documents...',
}: TopHeaderProps) {
  return (
    <header className="bg-slate-50/80 backdrop-blur-md flex justify-between items-center h-14 md:h-16 px-4 md:px-8 border-b border-slate-200/20">
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
          placeholder={searchPlaceholder}
          type="text"
        />
      </div>
      <div className="flex items-center gap-4 md:gap-6 ml-4 flex-shrink-0">
        <button className="text-slate-500 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
}
