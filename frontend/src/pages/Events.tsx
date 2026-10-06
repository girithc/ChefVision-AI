import { useState } from "react";
import { CalendarDays, Pencil, Plus, ShoppingCart, Trash2, Users, X } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { newId, useApp } from "@/lib/app-context";
import { formatDate, todayIso } from "@/lib/cn";
import { computeRequirements } from "@/lib/planning";
import { navigate } from "@/lib/router";
import type { PlannedEvent } from "@/lib/types";
import { fmtQty } from "@/lib/units";

function blankEvent(): PlannedEvent {
  return { id: newId("ev"), name: "", date: todayIso(), guests: 50, notes: "", recipes: [] };
}

/** Screen 5: catering orders and events with name, date, guest count, and linked recipes. */
export function Events() {
  const { events, recipes, saveEvent, deleteEvent } = useApp();
  const [draft, setDraft] = useState<PlannedEvent | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = todayIso();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((event) => event.date >= today);
  const past = sorted.filter((event) => event.date < today);
  const recipeName = (id: string) => recipes.find((recipe) => recipe.id === id)?.name ?? "Deleted recipe";

  const renderEvent = (event: PlannedEvent) => {
    const requirements = expanded === event.id ? computeRequirements([event], recipes) : [];
    return (
      <Card key={event.id} className="p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{event.name}</h3>
              {event.date < today && <Badge>Past</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.guests} guests</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {event.recipes.length === 0 && <span className="text-xs text-amber-600">No recipes linked</span>}
              {event.recipes.map((selection) => (
                <Badge key={selection.recipeId} tone="green">
                  {recipeName(selection.recipeId)} × {selection.servings}
                </Badge>
              ))}
            </div>
            {event.notes && <p className="mt-2 text-sm text-slate-500">{event.notes}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" onClick={() => setExpanded(expanded === event.id ? null : event.id)}>
              {expanded === event.id ? "Hide" : "Ingredients"}
            </Button>
            <Button variant="ghost" icon={Pencil} aria-label="Edit event" onClick={() => setDraft(event)} />
            <Button
              variant="danger"
              icon={Trash2}
              aria-label="Delete event"
              onClick={() => confirm(`Delete “${event.name}”?`) && deleteEvent(event.id)}
            />
          </div>
        </div>
        {expanded === event.id && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            {requirements.length === 0 ? (
              <p className="text-sm text-slate-500">Link recipes to see ingredient requirements.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                {requirements.map((req) => (
                  <div key={req.key} className="flex justify-between gap-2">
                    <span className="text-slate-600">{req.name}</span>
                    <span className="font-semibold tabular-nums">{fmtQty(req.qty)} {req.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Catering orders and events drive ingredient requirements and reorders."
        actions={
          <>
            <Button variant="secondary" icon={ShoppingCart} onClick={() => navigate("/reorder")}>Check inventory</Button>
            <Button icon={Plus} onClick={() => setDraft(blankEvent())}>New event</Button>
          </>
        }
      />

      {draft && (
        <EventForm
          event={draft}
          onCancel={() => setDraft(null)}
          onSave={(event) => {
            saveEvent(event);
            setDraft(null);
          }}
        />
      )}

      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No events planned"
            description="Add a catering order or event, pick recipes, and set serving counts."
            action={<Button icon={Plus} onClick={() => setDraft(blankEvent())}>New event</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Upcoming ({upcoming.length})</h2>
            <div className="space-y-3">
              {upcoming.map(renderEvent)}
              {upcoming.length === 0 && <p className="text-sm text-slate-400">No upcoming events.</p>}
            </div>
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Past ({past.length})</h2>
              <div className="space-y-3 opacity-75">{past.map(renderEvent)}</div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function EventForm({
  event: initial,
  onSave,
  onCancel,
}: {
  event: PlannedEvent;
  onSave(event: PlannedEvent): void;
  onCancel(): void;
}) {
  const { recipes } = useApp();
  const [event, setEvent] = useState(initial);
  const available = recipes.filter((recipe) => !event.recipes.some((selection) => selection.recipeId === recipe.id));
  const valid = event.name.trim() && event.date && event.guests > 0;

  return (
    <Card className="mb-6 border-brand-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{initial.name ? "Edit event" : "New event"}</h2>
        <Button variant="ghost" icon={X} aria-label="Close" onClick={onCancel} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="label">Event name</label>
          <input className="input" value={event.name} onChange={(e) => setEvent({ ...event, name: e.target.value })} placeholder="e.g. Rivera Wedding" />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} />
        </div>
        <div>
          <label className="label">Number of people</label>
          <input
            type="number"
            min={1}
            className="input"
            value={event.guests}
            onChange={(e) => {
              const guests = Number(e.target.value);
              // Recipes still at the old guest count follow the new one.
              const recipesScaled = event.recipes.map((selection) =>
                selection.servings === event.guests ? { ...selection, servings: guests } : selection,
              );
              setEvent({ ...event, guests, recipes: recipesScaled });
            }}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="label">Recipes and servings</label>
        <div className="space-y-2">
          {event.recipes.map((selection, index) => (
            <div key={selection.recipeId} className="flex items-center gap-2">
              <span className="flex-1 text-sm font-medium text-slate-800">
                {recipes.find((recipe) => recipe.id === selection.recipeId)?.name ?? "Deleted recipe"}
              </span>
              <input
                type="number"
                min={0}
                className="input w-28"
                value={selection.servings}
                onChange={(e) => {
                  const next = [...event.recipes];
                  next[index] = { ...selection, servings: Number(e.target.value) };
                  setEvent({ ...event, recipes: next });
                }}
              />
              <span className="text-xs text-slate-400">servings</span>
              <Button
                variant="danger"
                icon={Trash2}
                aria-label="Remove recipe"
                onClick={() => setEvent({ ...event, recipes: event.recipes.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
          {available.length > 0 ? (
            <select
              className="input max-w-xs"
              value=""
              onChange={(e) =>
                e.target.value &&
                setEvent({ ...event, recipes: [...event.recipes, { recipeId: e.target.value, servings: event.guests }] })
              }
            >
              <option value="">+ Add recipe…</option>
              {available.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>
          ) : (
            recipes.length === 0 && (
              <p className="text-sm text-slate-500">
                No recipes yet — <a className="text-brand-700 underline" href="#/recipes">create one</a>.
              </p>
            )
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="label">Notes</label>
        <textarea className="input min-h-20" value={event.notes} onChange={(e) => setEvent({ ...event, notes: e.target.value })} />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(event)} disabled={!valid}>Save event</Button>
      </div>
    </Card>
  );
}
