import React from "react";

interface PipelineCard {
  title: string;
  value: string;
  manager: string;
  priority?: string;
  time?: string;
  img?: string;
  icon?: string;
  active?: boolean;
  letter?: string;
  won?: boolean;
}

interface PipelineColumn {
  title: string;
  count: string;
  color: string;
  cards: PipelineCard[];
}

export default function PipelineManagement() {
  const columns: PipelineColumn[] = [
    { 
      title: "Discovery", 
      count: "04", 
      color: "bg-primary-container", 
      cards: [
        { title: "Neobank Infrastructure Expansion", value: "$2,450,000", priority: "HIGH", manager: "James Chen", time: "2h ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSEDVwcAtpwym31XY1io-ugWiLR3Yj_CYC8iqYiSmKQm5bFX-geLylSCl_b-O4LoPGfjUP0EG2bDGOFWwmZImmkTgjv7oEDnJ69B0W-2lGg2TfipboBe3R0pwm1m6Nn-cK50FfB8fH1JTGsGkBGP89QS7IApeXCv4NxZ3lfPx81DxjfGZ2NSBgorsiGJWWkg6-jcYAxgbFhePy_x3qJD49Y29hy4MCfXeLnYClAWmPS4rqA5WBxRavWuuRLMsNWmlL_NqoW8RbUfw" },
        { title: "SkyBound Logistics Series B", value: "$850,000", priority: "MEDIUM", manager: "Sarah Miller", time: "5h ago", icon: "rocket_launch" }
      ] 
    },
    { 
      title: "Qualification", 
      count: "03", 
      color: "bg-secondary", 
      cards: [
        { title: "Acme Global Data Audit", value: "$1,200,000", priority: "HIGH", manager: "James Chen", time: "1d ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtL02Aghj5gXviYK-CSF38dRi_-iy_excOzhrSE0GyUNZ-9K-ZrdeFjD9vIPmMr_5uaMxsjVNSWF6wBHzZ4HMQQCeXBTrdU88nyBeGvG0NWraTxlbIQPTx9fkF3ij_Qo4MUjjbJ2NiYagyPAdSB-O4sb2CseykUiazjW72uFT8TnyPKI0S8J2PUvJCCDp7VE0Yd40zMJM4_xlSLsDODhArrgib0dmnIrzzxWTCrEYjkGA2qnnvFcbZowp7emiUODAJzKpeloKAPG8" }
      ] 
    },
    { 
      title: "Negotiation", 
      count: "01", 
      color: "bg-tertiary", 
      cards: [
        { title: "Vertex Alpha Acquisition", value: "$5,600,000", priority: "HIGH", manager: "Alex Stratton", active: true, letter: "V" }
      ] 
    },
    { 
      title: "Legal Review", 
      count: "02", 
      color: "bg-outline", 
      cards: [
        { title: "Horizon Media Buy-Out", value: "$1,100,000", priority: "MEDIUM", manager: "Sarah Miller", time: "3d ago", icon: "gavel" }
      ] 
    },
    { 
      title: "Closed", 
      count: "08", 
      color: "bg-emerald-500", 
      cards: [
        { title: "Quantum Cloud Services", value: "$3,200,000", won: true, manager: "James Chen", time: "Dec 12", icon: "check_circle" }
      ] 
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-fade-in">
      {/* Pipeline Filter & Header */}
      <section className="px-8 py-8 bg-surface shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter mb-2">Deal Pipeline</h2>
            <p className="text-on-surface-variant max-w-lg font-body">Manage high-velocity deal flow through structured institutional stages. Total active value: <span className="text-primary font-bold">$12.4M</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container-low p-1 rounded-xl">
              <button className="px-4 py-2 bg-white text-primary rounded-lg shadow-sm text-sm font-bold transition-all">Pipeline</button>
              <button className="px-4 py-2 text-on-surface-variant text-sm font-semibold hover:text-primary transition-all">List View</button>
              <button className="px-4 py-2 text-on-surface-variant text-sm font-semibold hover:text-primary transition-all">Analytics</button>
            </div>
            <button className="flex items-center gap-2 bg-surface-container-highest px-4 py-2.5 rounded-xl text-primary text-sm font-bold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined notranslate text-sm" translate="no">filter_list</span>
              Filter
            </button>
          </div>
        </div>
        {/* Filters Strip */}
        <div className="flex flex-wrap gap-4 mt-8">
          {[
            { label: "Industry", val: "FinTech" },
            { label: "Min Value", val: "$500k" },
          ].map((f, i) => (
            <div key={i} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-full text-xs font-semibold text-on-surface-variant flex items-center gap-2 shadow-sm">
              <span>{f.label}: <b>{f.val}</b></span>
              <span className="material-symbols-outlined notranslate text-xs cursor-pointer hover:text-error transition-colors" translate="no">close</span>
            </div>
          ))}
          <div className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-full text-xs font-semibold text-on-surface-variant flex items-center gap-2 shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
            <span>Manager: <b>All</b></span>
            <span className="material-symbols-outlined notranslate text-xs" translate="no">arrow_drop_down</span>
          </div>
        </div>
      </section>

      {/* Kanban Board */}
      <section className="flex-1 overflow-x-auto px-8 pb-12 bg-surface-container-low/30 scrollbar-thin scrollbar-thumb-outline-variant/30">
        <div className="flex gap-6 h-full min-w-max pt-4">
          {columns.map((column, i) => (
            <div key={i} className="w-80 flex flex-col gap-4 group">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.color}`}></span>
                  <h3 className="font-headline font-bold text-on-surface uppercase tracking-wider text-xs">{column.title}</h3>
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold">{column.count}</span>
                </div>
                <span className="material-symbols-outlined notranslate text-on-surface-variant/40 text-sm cursor-pointer hover:text-primary transition-colors" translate="no">more_horiz</span>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-8 px-1">
                {column.cards.map((card, j) => (
                  <div 
                    key={j} 
                    className={`bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-grab active:cursor-grabbing border-b-2 border-transparent hover:border-primary/20 ${column.title === 'Closed' ? 'opacity-70 grayscale-[0.5] border-l-4 border-emerald-500' : ''} ${card.active ? 'ring-2 ring-primary/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {card.img ? (
                        <img alt="Company Logo" className="w-10 h-10 rounded-lg object-contain bg-surface-container p-1" src={card.img} />
                      ) : card.letter ? (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{card.letter}</div>
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.won ? 'bg-emerald-50 text-emerald-600' : 'bg-tertiary/10 text-tertiary'}`}>
                          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontVariationSettings: card.won ? "'FILL' 1" : undefined }}>{card.icon}</span>
                        </div>
                      )}
                      {card.priority && (
                        <span className={`${card.priority === 'HIGH' ? 'bg-primary/10 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'} px-2.5 py-1 rounded-full text-[10px] font-bold`}>
                          {card.priority}
                        </span>
                      )}
                      {card.won && <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">WON</span>}
                    </div>
                    <h4 className="font-headline font-bold text-on-surface text-base leading-tight mb-1">{card.title}</h4>
                    <p className={`${card.won ? 'text-emerald-600' : 'text-primary'} font-bold text-sm mb-4`}>{card.value}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant/10 flex items-center justify-center overflow-hidden">
                          <span className="material-symbols-outlined notranslate text-sm text-outline" translate="no">person</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant">{card.manager}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${card.active ? 'text-primary font-bold uppercase tracking-widest' : 'text-on-surface-variant/60'}`}>
                        {card.active ? 'Active Now' : card.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Execution HUD (Floating Footer Action Bar) */}
      <div className="fixed bottom-8 left-[calc(50%+128px)] -translate-x-1/2 z-[60] executive-glass border border-white/20 px-6 py-4 rounded-full shadow-2xl flex items-center gap-8">
        <div className="flex -space-x-3">
          {[1, 2].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-highest bg-surface-container overflow-hidden">
               <span className="material-symbols-outlined notranslate text-on-surface-variant flex items-center justify-center h-full" translate="no">person</span>
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white border-2 border-surface-container-highest">+4</div>
        </div>
        <div className="h-6 w-px bg-outline-variant/30"></div>
        <div className="text-xs font-semibold text-on-surface">
          Team is currently finalizing <span className="text-primary font-bold">3 contracts</span>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
          Review Updates
        </button>
      </div>
    </div>
  );
}
