import {
  Bell,
  Bike,
  Bot,
  Boxes,
  CalendarCheck,
  ChefHat,
  ChevronRight,
  ClipboardList,
  Cpu,
  DollarSign,
  Layers,
  LayoutGrid,
  LineChart,
  Lock,
  Moon,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import LandingScrollEffect from "./LandingScrollEffect";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center scroll-smooth selection:bg-brand-200 selection:text-brand-900">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col min-h-screen">
        <header className="w-full h-20 flex items-center justify-between relative z-40">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900">
              {"ChefVizion AI"}
            </span>
          </Link>
          <div className="flex items-center">
            <Link href="/product" className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-6 py-2 rounded-full transition-all duration-200 shadow-md hover:-translate-y-0.5 active:translate-y-0">
              {"Get Started"}
            </Link>
          </div>
        </header>
        <section className="w-full pt-6 pb-2 sm:pt-8 sm:pb-3 text-center flex flex-col items-center justify-center relative z-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-[2.4rem] sm:text-[3.4rem] lg:text-[4.1rem] font-bold tracking-tight text-slate-900 leading-[1.12]">
              {"AI Agents for Smarter"}
              <br />
              <span className="text-emerald-500">
                {"Restaurant Operations"}
              </span>
            </h1>
          </div>
        </section>
        <section id="product" className="w-full flex-1 min-h-[94vh] sm:min-h-[102vh] lg:min-h-[110vh] pt-10 sm:pt-14 lg:pt-20 pb-10 sm:pb-14 perspective-stage flex justify-center items-stretch relative z-10">
          <div className="w-full h-full flex justify-center">
            <div id="dashboardMockup" className="w-full h-full rounded-[24px] sm:rounded-[28px] p-2 sm:p-2.5 bg-white/70 backdrop-blur-2xl border border-white/95 shadow-xl transition-transform flex flex-col min-h-0" style={{ transform: "rotateX(9deg) scale(0.7)", boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.95)" }}>
              <div className="w-full bg-slate-100/90 backdrop-blur-md px-4 py-3.5 rounded-t-[18px] sm:rounded-t-[22px] border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90">
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/80 px-3 py-1 rounded-lg text-[10px] text-slate-500 font-medium w-56 sm:w-64 justify-center shadow-2xs">
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-slate-700 font-mono tracking-tight">
                    {"app.chefvizion.ai/restaurant-ops"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <Share2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex-1 min-h-0 bg-white/95 backdrop-blur-xl rounded-b-[18px] sm:rounded-b-[22px] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
                <aside className="w-full md:w-52 lg:w-60 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between shrink-0 min-h-0 bg-slate-50/40">
                  <div>
                    <div className="flex items-center gap-2 mb-3.5 px-1">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-display font-bold text-sm text-slate-800 tracking-tight">
                        {"ChefVizion AI"}
                      </span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1.5">
                      {"MAIN MENU"}
                    </div>
                    <nav className="space-y-2">
                      <a href="#" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold text-xs shadow-xs">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>
                          {"Dashboard"}
                        </span>
                      </a>
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {"Kitchen KDS"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">
                          {"Live"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {"AI Agents"}
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {"Reservation Flow"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Bike className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {"Delivery Sync"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <Boxes className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {"Smart Inventory"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <Utensils className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {"Table Orders"}
                        </span>
                      </div>
                    </nav>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-3.5 mb-2 px-1.5">
                      {"INTELLIGENCE"}
                    </div>
                    <nav className="space-y-2">
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100/70 text-xs font-medium cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <LineChart className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {"Shift Analytics"}
                          </span>
                        </div>
                      </div>
                    </nav>
                  </div>
                  <div className="pt-4 border-t border-slate-100 text-[10px] hidden md:block">
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse">
                      </span>
                      <span>
                        {"18 Active Agents Running"}
                      </span>
                    </div>
                  </div>
                </aside>
                <main className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative w-full max-w-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Search orders, tickets, agents..." className="w-full bg-slate-50 border border-slate-200/80 pl-8 pr-14 py-1 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 placeholder:text-slate-400" />
                      <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-brand-600 border border-slate-200 shadow-2xs">
                        {"Search"}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <button className="p-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-slate-900 transition-colors relative">
                        <Bell className="w-3.5 h-3.5" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping">
                        </span>
                      </button>
                      <div className="flex items-center bg-slate-50 border border-slate-200/80 p-0.5 rounded-lg">
                        <span className="p-0.5 text-slate-400">
                          <Moon className="w-3 h-3" />
                        </span>
                        <span className="p-0.5 bg-white text-emerald-600 rounded shadow-xs">
                          <Sun className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-50/95 via-teal-50/60 to-cyan-50/40 p-4 sm:p-5 border border-emerald-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8.5px] font-bold uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-white animate-ping">
                          </span>
                          {"18 Autonomous Agents Active"}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                          {"AI Agent Kitchen Dispatch"}
                        </h3>
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        {"Real-time table pacing, autonomous recipe prep firing, and shift balance."}
                      </p>
                    </div>
                    <button className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-500/20 transition-all shrink-0 active:scale-95">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {"Auto-Optimize Shifts"}
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                            {"▲ 45%"}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-[9.5px] text-slate-400 font-medium">
                            {"Total Sales"}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            {"$500K"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5 mt-3 h-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-emerald-200 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-200 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-emerald-300 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-300 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-300 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-400 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-400 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-emerald-500 rounded-full">
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <ClipboardList className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                            {"▲ 25%"}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-[9.5px] text-slate-400 font-medium">
                            {"Table Orders"}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            {"20K"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5 mt-3 h-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-indigo-200 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-indigo-200 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-indigo-300 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-indigo-300 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-indigo-400 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-indigo-400 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-indigo-500 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-indigo-500 rounded-full">
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
                            <Users className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">
                            {"▲ 45%"}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-[9.5px] text-slate-400 font-medium">
                            {"Guest Count"}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            {"145K"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5 mt-3 h-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-sky-200 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-sky-200 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-sky-300 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-sky-300 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-sky-400 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-sky-400 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-sky-500 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-sky-500 rounded-full">
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Timer className="w-3 h-3" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                            {"▼ 18%"}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <div className="text-[9.5px] text-slate-400 font-medium">
                            {"Ticket Velocity"}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            {"14 min"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5 mt-3 h-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-rose-200 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-rose-200 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-rose-300 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-rose-300 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-rose-400 rounded-full">
                          </span>
                          <span className="w-1 h-1 bg-rose-400 rounded-full">
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full">
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse">
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {"Live AI Agent Telemetry"}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        {"Synchronous Dispatch Active"}
                      </span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                      <table className="w-full text-left text-[11.5px]">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100 font-medium">
                            <th className="pb-3 pl-1">
                              {"Agent Name"}
                            </th>
                            <th className="pb-3">
                              {"Station / Target"}
                            </th>
                            <th className="pb-3">
                              {"Active Operation"}
                            </th>
                            <th className="pb-3">
                              {"Status"}
                            </th>
                            <th className="pb-3 pr-1 text-right">
                              {"Confidence"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500">
                              </span>
                              {"Prep Bot"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Garde Manger & Saute"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Pre-portioned 45 Truffle Risotto kits"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {"Active"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"99.4%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500">
                              </span>
                              {"Hostess AI"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Front of House / Floor"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Paced 14 reservations, zero queue bottleneck"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {"Pacing"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"98.8%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500">
                              </span>
                              {"Stock Sentry"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Walk-in Coolers 01 & 02"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Auto-dispatched Wagyu Ribeye restock order"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9px] font-medium text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                                {"Restocked"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"100%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500">
                              </span>
                              {"Sommelier Copilot"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Wine Cellar & Bar"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Paired 8 vintage pinot noirs with tasting menu"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {"Paired"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"97.9%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500">
                              </span>
                              {"Grill Sentinel"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Grill Stations 04 & 05"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Rebalanced 22 steak orders across open burners"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9.5px] font-medium text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                                {"Optimized"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"98.2%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500">
                              </span>
                              {"Dessert Dispatcher"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Pastry / Cold Station"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Queued 16 soufflés for synchronized service"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9.5px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                {"Queued"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"96.5%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500">
                              </span>
                              {"Allergen Guard"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Expo & Ticket Review"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Verified 34 allergen flags before dispatch"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9.5px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                {"Verified"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"99.8%"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pl-1 font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500">
                              </span>
                              {"Procurement Bot"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Supplier Network"}
                            </td>
                            <td className="py-3 text-slate-600">
                              {"Negotiated 48-hour pricing on seasonal produce"}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center text-[9.5px] font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                {"Negotiating"}
                              </span>
                            </td>
                            <td className="py-3 pr-1 text-right font-bold text-slate-900">
                              {"95.7%"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-10 relative z-20">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
              {"Autonomous Kitchen Intelligence"}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {"Engineered for high-volume restaurant excellence"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">
                {"Dynamic Table Pacing"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {"AI monitors real-time guest dining tempo and synchronizes cook start times across every kitchen station."}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">
                {"Autonomous KDS Routing"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {"No manual order expediting needed. Dishes auto-route to cold prep, sauté, and grill stations synchronously."}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">
                {"Zero-Waste AI Prep"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {"Predicts reservation volume, local weather, and events to calculate exact daily ingredient prep quotas."}
              </p>
            </div>
          </div>
        </section>
        <footer className="w-full py-8 text-xs text-slate-500 relative z-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-800">
                {"ChefVizion AI"}
              </span>
              <span>
                {"© 2026 ChefVizion Intelligence Inc."}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:text-emerald-700 transition-colors">
                {"Privacy Policy"}
              </a>
              <a href="#" className="hover:text-emerald-700 transition-colors">
                {"Terms of Service"}
              </a>
              <a href="#" className="hover:text-emerald-700 transition-colors">
                {"API Docs"}
              </a>
            </div>
          </div>
        </footer>
      </div>
      <LandingScrollEffect />
    </div>
  );
}
