import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { de } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export interface DateRangeValue {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

type PresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "allTime"
  | "custom";

interface Preset {
  id: PresetId;
  label: string;
  getRange: () => { from: Date; to: Date };
}

const PRESETS: Preset[] = [
  {
    id: "today",
    label: "Heute",
    getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    id: "yesterday",
    label: "Gestern",
    getRange: () => {
      const d = subDays(new Date(), 1);
      return { from: startOfDay(d), to: endOfDay(d) };
    },
  },
  {
    id: "last7",
    label: "Letzte 7 Tage",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
  },
  {
    id: "last14",
    label: "Letzte 14 Tage",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 13)), to: endOfDay(new Date()) }),
  },
  {
    id: "last30",
    label: "Letzte 30 Tage",
    getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }),
  },
  {
    id: "thisWeek",
    label: "Diese Woche",
    getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfDay(new Date()) }),
  },
  {
    id: "lastWeek",
    label: "Letzte Woche",
    getRange: () => {
      const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      return { from: lastWeekStart, to: lastWeekEnd };
    },
  },
  {
    id: "thisMonth",
    label: "Dieser Monat",
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }),
  },
  {
    id: "lastMonth",
    label: "Letzter Monat",
    getRange: () => {
      const d = subMonths(new Date(), 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    },
  },
  {
    id: "thisYear",
    label: "Dieses Jahr",
    getRange: () => ({ from: startOfYear(new Date()), to: endOfDay(new Date()) }),
  },
  {
    id: "lastYear",
    label: "Letztes Jahr",
    getRange: () => {
      const d = subYears(new Date(), 1);
      return { from: startOfYear(d), to: endOfYear(d) };
    },
  },
  {
    id: "allTime",
    label: "All Time",
    getRange: () => ({ from: new Date("2024-01-01"), to: endOfDay(new Date()) }),
  },
];

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId>("last7");
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(() => ({
    from: new Date(value.startDate + "T00:00:00"),
    to: new Date(value.endDate + "T00:00:00"),
  }));

  function applyPreset(preset: Preset) {
    const range = preset.getRange();
    setActivePreset(preset.id);
    setCalendarRange({ from: range.from, to: range.to });
    onChange({
      startDate: toDateStr(range.from),
      endDate: toDateStr(range.to),
      label: preset.label,
    });
    setOpen(false);
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setCalendarRange(range);
    if (range?.from && range?.to) {
      setActivePreset("custom");
      onChange({
        startDate: toDateStr(range.from),
        endDate: toDateStr(range.to),
        label: `${format(range.from, "dd.MM.yyyy")} – ${format(range.to, "dd.MM.yyyy")}`,
      });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 border-border bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-gold" />
          {value.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border bg-card" align="end" sideOffset={8}>
        <div className="flex">
          {/* Presets sidebar */}
          <div className="border-r border-border p-3 space-y-0.5 min-w-[140px]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Zeitraum</p>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                  activePreset === preset.id
                    ? "bg-gold/20 font-semibold text-gold"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={calendarRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              locale={de}
              weekStartsOn={1}
              className="text-foreground"
            />
            {activePreset === "custom" && calendarRange?.from && calendarRange?.to && (
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-[11px] text-muted-foreground">
                  {format(calendarRange.from, "dd.MM.yyyy")} – {format(calendarRange.to, "dd.MM.yyyy")}
                </span>
                <Button
                  size="sm"
                  className="h-7 bg-gold text-navy text-xs font-bold hover:bg-gold/90"
                  onClick={() => setOpen(false)}
                >
                  Anwenden
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
