"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DateRangePickerProps = {
  className?: string;
  maxDays?: number;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
};

type Preset = {
  label: string;
  from: Date;
  to: Date;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildPresets = (): Preset[] => {
  const today = new Date();

  return [
    { label: "Today", from: today, to: today },
    {
      label: "Last 7 days",
      from: subDays(today, 6),
      to: today,
    },
    {
      label: "Last 30 days",
      from: subDays(today, 29),
      to: today,
    },
    {
      label: "This month",
      from: startOfMonth(today),
      to: today,
    },
  ];
};

export function DateRangePicker({
  className,
  maxDays = 365,
  value,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tentativeRange, setTentativeRange] =
    React.useState<DateRange>(() => value ?? {
      from: subDays(new Date(), 29),
      to: new Date(),
    });
  const [viewDate, setViewDate] = React.useState(
    () => value?.from ?? new Date(),
  );
  const presets = React.useMemo(() => buildPresets(), []);
  const displayRange = value ?? tentativeRange;

  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);

    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [viewDate]);

  const selectingEnd = Boolean(
    tentativeRange.from && !tentativeRange.to,
  );
  const latestAllowedDate = tentativeRange.from && selectingEnd
    ? addDays(tentativeRange.from, maxDays - 1)
    : undefined;

  const isDisabledDate = (day: Date) => {
    const normalizedDay = startOfDay(day);
    const future = isAfter(normalizedDay, startOfDay(new Date()));
    const beyondLimit = latestAllowedDate
      ? isAfter(normalizedDay, startOfDay(latestAllowedDate))
      : false;

    return future || beyondLimit;
  };

  const commitRange = (range: DateRange) => {
    setTentativeRange(range);
    onChange?.(range);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && value) {
      setTentativeRange(value);
      setViewDate(value.from ?? new Date());
    }
    setOpen(nextOpen);
  };

  const handleSelectDate = (clickedDate: Date) => {
    if (isDisabledDate(clickedDate)) return;

    if (!tentativeRange.from || tentativeRange.to) {
      setTentativeRange({ from: clickedDate, to: undefined });
      return;
    }

    if (isBefore(clickedDate, tentativeRange.from)) {
      setTentativeRange({ from: clickedDate, to: undefined });
      return;
    }

    commitRange({ from: tentativeRange.from, to: clickedDate });
  };

  const applyPreset = (preset: Preset) => {
    setViewDate(preset.from);
    commitRange({ from: preset.from, to: preset.to });
  };

  const nextMonthIsFuture = isAfter(
    startOfMonth(addMonths(viewDate, 1)),
    startOfMonth(new Date()),
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-start text-left sm:w-[280px]",
          )}
        >
          <CalendarIcon className="mr-2 size-4 text-primary" />
          <RangeLabel range={displayRange} />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className={
            "flex w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-hidden " +
            "rounded-2xl border bg-popover p-0 " +
            "shadow-xl sm:flex-row"
          }
        >
          <PresetList
            displayRange={displayRange}
            onSelect={applyPreset}
            presets={presets}
          />

          <div className="w-[310px] max-w-full p-4">
            <CalendarHeader
              disableNext={nextMonthIsFuture}
              onNext={() => setViewDate((date) => addMonths(date, 1))}
              onPrevious={() => {
                setViewDate((date) => subMonths(date, 1));
              }}
              viewDate={viewDate}
            />

            <div className="mb-1 grid grid-cols-7 gap-1 text-center">
              {weekdays.map((day) => (
                <span
                  key={day}
                  className={
                    "flex h-6 items-center justify-center text-[10px] " +
                    "font-bold uppercase tracking-wider " +
                    "text-muted-foreground"
                  }
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((day) => (
                <CalendarDay
                  key={day.toISOString()}
                  day={day}
                  disabled={isDisabledDate(day)}
                  onSelect={handleSelectDate}
                  range={tentativeRange}
                  viewDate={viewDate}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RangeLabel({ range }: { range: DateRange }) {
  if (!range.from) {
    return <span>Pick a date range</span>;
  }

  if (!range.to) {
    return <span>{format(range.from, "LLL dd, yyyy")}</span>;
  }

  return (
    <span className="truncate">
      {format(range.from, "LLL dd, yyyy")}
      {" – "}
      {format(range.to, "LLL dd, yyyy")}
    </span>
  );
}

function PresetList({
  displayRange,
  onSelect,
  presets,
}: {
  displayRange: DateRange;
  onSelect: (preset: Preset) => void;
  presets: Preset[];
}) {
  return (
    <div
      className={
        "flex min-w-[140px] flex-col gap-1 border-b bg-muted/30 p-3 " +
        "sm:border-b-0 sm:border-r"
      }
    >
      <p
        className={
          "mb-1 px-2 text-[10px] font-bold uppercase tracking-wider " +
          "text-muted-foreground"
        }
      >
        Quick presets
      </p>
      {presets.map((preset) => {
        const selected = Boolean(
          displayRange.from &&
          displayRange.to &&
          isSameDay(displayRange.from, preset.from) &&
          isSameDay(displayRange.to, preset.to),
        );

        return (
          <button
            key={preset.label}
            className={cn(
              "flex w-full items-center justify-between rounded-lg",
              "px-2.5 py-1.5 text-left text-xs",
              "transition-colors hover:bg-muted",
              selected && "bg-primary/10 text-primary",
            )}
            onClick={() => onSelect(preset)}
            type="button"
          >
            <span>{preset.label}</span>
            {selected ? <Check className="size-3" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function CalendarHeader({
  disableNext,
  onNext,
  onPrevious,
  viewDate,
}: {
  disableNext: boolean;
  onNext: () => void;
  onPrevious: () => void;
  viewDate: Date;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm">
        {format(viewDate, "MMMM yyyy")}
      </span>
      <div className="flex items-center gap-0.5">
        <Button
          aria-label="Previous month"
          className="size-7 rounded-lg text-muted-foreground"
          onClick={onPrevious}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          aria-label="Next month"
          className="size-7 rounded-lg text-muted-foreground"
          disabled={disableNext}
          onClick={onNext}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function CalendarDay({
  day,
  disabled,
  onSelect,
  range,
  viewDate,
}: {
  day: Date;
  disabled: boolean;
  onSelect: (day: Date) => void;
  range: DateRange;
  viewDate: Date;
}) {
  const start = Boolean(range.from && isSameDay(day, range.from));
  const end = Boolean(range.to && isSameDay(day, range.to));
  const inRange = Boolean(
    range.from &&
    range.to &&
    isAfter(day, range.from) &&
    isBefore(day, range.to),
  );
  const currentMonth = isSameMonth(day, viewDate);

  return (
    <button
      aria-label={format(day, "MMMM d, yyyy")}
      className={cn(
        "relative flex size-8 items-center justify-center rounded-lg",
        "text-xs transition-colors",
        !currentMonth && "opacity-35",
        currentMonth && !start && !end && !inRange && "hover:bg-muted",
        inRange && "rounded-none bg-primary/10 text-primary",
        (start || end) && "z-10 bg-primary text-primary-foreground",
        disabled && "cursor-not-allowed opacity-25",
      )}
      disabled={disabled}
      onClick={() => onSelect(day)}
      type="button"
    >
      {format(day, "d")}
    </button>
  );
}

export const CustomDatePickerWithRange = DateRangePicker;
