import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

import { Button, Card, PageHeader } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { cn, todayIso } from "@/lib/cn";
import { computeRequirements } from "@/lib/planning";
import { navigate } from "@/lib/router";
import { fmtQty } from "@/lib/units";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Screen 7: all events in a month plus the combined ingredient list, broken down by week. */
export function MonthlyView() {
  const { events, recipes } = useApp();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const key = monthKey(cursor);
  const monthEvents = useMemo(
    () => events.filter((event) => event.date.startsWith(key)).sort((a, b) => a.date.localeCompare(b.date)),
    [events, key],
  );
  const requirements = useMemo(() => computeRequirements(monthEvents, recipes), [monthEvents, recipes]);

  // Calendar grid
  const firstWeekday = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const weekCount = cells.length / 7;
  const weekOf = (isoDate: string) => Math.floor((firstWeekday + Number(isoDate.slice(8, 10)) - 1) / 7);

  // Week-by-week totals for each requirement
  const weekly = requirements.map((req) => {
    const perWeek = Array<number>(weekCount).fill(0);
    for (const driver of req.drivers) perWeek[weekOf(driver.eventDate)] += driver.qty;
    return { ...req, perWeek };
  });

  const shift = (months: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + months, 1));
  const today = todayIso();

  return (
    <>
      <PageHeader
        title="Monthly View"
        subtitle="Events for the month and the combined ingredients they need."
        actions={<Button variant="secondary" icon={ShoppingCart} onClick={() => navigate("/reorder")}>Check inventory</Button>}
      />

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" icon={ChevronLeft} aria-label="Previous month" onClick={() => shift(-1)} />
          <h2 className="font-display text-lg font-bold text-slate-900">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" icon={ChevronRight} aria-label="Next month" onClick={() => shift(1)} />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
          {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            const iso = day ? `${key}-${String(day).padStart(2, "0")}` : "";
            const dayEvents = day ? monthEvents.filter((event) => event.date === iso) : [];
            return (
              <div
                key={index}
                className={cn(
                  "min-h-20 rounded-lg p-1.5 text-left text-xs",
                  day ? "bg-slate-50" : "bg-transparent",
                  iso === today && "ring-2 ring-brand-400",
                )}
              >
                {day && <div className="mb-1 font-semibold text-slate-500">{day}</div>}
                {dayEvents.map((event) => (
                  <a
                    key={event.id}
                    href="#/events"
                    className="mb-0.5 block truncate rounded bg-brand-500 px-1 py-0.5 text-[10px] font-semibold text-white"
                    title={`${event.name} · ${event.guests} guests`}
                  >
                    {event.name}
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold text-slate-900">Ingredients needed this month</h2>
        <p className="mb-3 text-sm text-slate-500">
          {monthEvents.length} event{monthEvents.length === 1 ? "" : "s"} ·{" "}
          {monthEvents.reduce((sum, event) => sum + event.guests, 0)} guests
        </p>
        {weekly.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No events with recipes this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  {Array.from({ length: weekCount }, (_, i) => <th key={i} className="text-right">Week {i + 1}</th>)}
                  <th className="text-right">Month total</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((row) => (
                  <tr key={row.key}>
                    <td className="font-medium text-slate-900">{row.name}</td>
                    {row.perWeek.map((qty, i) => (
                      <td key={i} className={cn("text-right tabular-nums", qty === 0 && "text-slate-300")}>
                        {qty === 0 ? "—" : fmtQty(qty)}
                      </td>
                    ))}
                    <td className="text-right font-semibold tabular-nums">{fmtQty(row.qty)} {row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
