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
    <header className="bg-slate-50/80 backdrop-blur-md flex justify-between items-center h-16 px-8 border-b border-slate-200/20">
      <div className="relative w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
          placeholder={searchPlaceholder}
          type="text"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-500 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
}
