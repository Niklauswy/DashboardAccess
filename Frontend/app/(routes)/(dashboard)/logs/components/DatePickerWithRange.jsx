"use client";

import * as React from "react";
import {
  format,
  parse,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  setDate,
  startOfDay,
  endOfDay
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DatePickerWithRange({ onChange, reset, className }) {
  const [date, setDate] = React.useState(null);
  const [presetKey, setPresetKey] = React.useState("");
  
  // Reset date when requested from parent
  React.useEffect(() => {
    if (reset !== undefined) {
      setDate(null);
      setPresetKey("");
    }
  }, [reset]);

  // Handle date change and report to parent
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate);
    setPresetKey(""); // Clear preset when manually selecting
  };

  // Handle preset selection from dropdown
  const handlePresetSelection = (value) => {
    let from, to;
    const today = new Date();
    
    switch (value) {
      case "today":
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case "yesterday":
        from = startOfDay(addDays(today, -1));
        to = endOfDay(addDays(today, -1));
        break;
      case "last7days":
        from = startOfDay(addDays(today, -6));
        to = endOfDay(today);
        break;
      case "thisWeek":
        from = startOfWeek(today, { locale: es });
        to = endOfWeek(today, { locale: es });
        break;
      case "lastWeek":
        from = startOfWeek(addDays(today, -7), { locale: es });
        to = endOfWeek(addDays(today, -7), { locale: es });
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "lastMonth":
        from = startOfMonth(addMonths(today, -1));
        to = endOfMonth(addMonths(today, -1));
        break;
      case "semester2024-1":
        // Semester 1 of 2024 (Jan - Jun)
        from = new Date(2024, 0, 1); // Jan 1, 2024
        to = new Date(2024, 5, 30);  // Jun 30, 2024
        break;
      case "semester2024-2":
        // Semester 2 of 2024 (Jul - Dec)
        from = new Date(2024, 6, 1); // Jul 1, 2024
        to = new Date(2024, 11, 31); // Dec 31, 2024
        break;
      case "semester2025-1":
        // Semester 1 of 2025 (Jan - Jun)
        from = new Date(2025, 0, 1); // Jan 1, 2025
        to = new Date(2025, 5, 30);  // Jun 30, 2025
        break;
      default:
        return;
    }

    setPresetKey(value);
    const newDate = { from, to };
    setDate(newDate);
    onChange(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-4">
            <Select
              value={presetKey}
              onValueChange={handlePresetSelection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rango predefinido" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="last7days">Últimos 7 días</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="lastWeek">Semana pasada</SelectItem>
                  <SelectItem value="thisMonth">Este mes</SelectItem>
                  <SelectItem value="lastMonth">Mes pasado</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectItem value="semester2024-1">Semestre 2024-1</SelectItem>
                  <SelectItem value="semester2024-2">Semestre 2024-2</SelectItem>
                  <SelectItem value="semester2025-1">Semestre 2025-1</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <div className="rounded-md border p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from || new Date()}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
                locale={es}
                disabled={(date) => date > new Date() || date < new Date("2023-01-01")}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setDate(null);
                  setPresetKey("");
                  onChange(null);
                }} 
                variant="outline" 
                className="mr-2"
              >
                Limpiar
              </Button>
              <Button onClick={() => document.body.click()}>
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}