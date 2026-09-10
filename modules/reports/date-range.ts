import type { DateRange } from "@/components/DateRangePicker";
import type { ReportDateRange } from "@/modules/reports/types";

export const toDateValue = (date: Date) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

export const createReportDateRange = (
    days: number = 30,
): ReportDateRange => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    return {
        startDate: toDateValue(start),
        endDate: toDateValue(end),
    };
};

export const fromPickerRange = (
    range: DateRange,
): ReportDateRange | undefined => {
    if (!range.from || !range.to) {
        return undefined;
    }

    return {
        startDate: toDateValue(range.from),
        endDate: toDateValue(range.to),
    };
};

export const toPickerRange = (
    range: ReportDateRange,
): DateRange => ({
    from: new Date(`${range.startDate}T12:00:00`),
    to: new Date(`${range.endDate}T12:00:00`),
});
