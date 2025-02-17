"use client";

import * as React from "react";
import {format, parse, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth} from "date-fns";
import {es} from "date-fns/locale";
import {Calendar as CalendarIcon} from "lucide-react";
import {cn} from "@/components/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DatePickerWithRange = ({onChange, reset, className}) => {
    const [date, setDate] = React.useState(null);

    React.useEffect(() => {
        if (reset) {
            setDate(null);
        }
    }, [reset]);

    const handleDateChange = (selectedDate) => {
        setDate(selectedDate);
        onChange(selectedDate);
    };

    const handleRelativeDateChange = (option) => {
        let from, to;

        switch (option) {
            case "this_week":
                from = startOfWeek(new Date(), {weekStartsOn: 1});
                to = endOfWeek(new Date(), {weekStartsOn: 1});
                break;
            case "this_month":
                from = startOfMonth(new Date());
                to = endOfMonth(new Date());
                break;
            case "2024-2":
                from = parse("2024 Jul 23 05:02:45", "yyyy MMM dd HH:mm:ss", new Date());
                to = parse("2024 Nov 30 05:02:45", "yyyy MMM dd HH:mm:ss", new Date());
                break;
            case "2025-1":
                from = parse("2025 Jan 27 05:02:45", "yyyy MMM dd HH:mm:ss", new Date());
                to = parse("2025 May 30 05:02:45", "yyyy MMM dd HH:mm:ss", new Date());
                break;
            default:
                from = to = new Date();
        }

        handleDateChange({from, to});
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/yyyy", {locale: es})} -{" "}
                                    {format(date.to, "dd/MM/yyyy", {locale: es})}
                                </>
                            ) : (
                                format(date.from, "dd/MM/yyyy", {locale: es})
                            )
                        ) : (
                            <span>Seleccionar fecha</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Select
                        onValueChange={handleRelativeDateChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rango preferido"/>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="this_week">Esta semana</SelectItem>
                            <SelectItem value="this_month">Este mes</SelectItem>
                            <SelectItem value="2024-2">Periodo 2024-2 </SelectItem>
                            <SelectItem value="2025-1">Periodo 2025-1 </SelectItem>

                        </SelectContent>
                    </Select>
                    <div className="rounded-md border mt-2">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DatePickerWithRange;