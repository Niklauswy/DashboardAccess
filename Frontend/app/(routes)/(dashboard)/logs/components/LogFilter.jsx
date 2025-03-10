"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import DatePickerWithRange from "./DatePickerWithRange";

export default function LogFilter({ logs, filters, setFilters }) {
  const [userInputValue, setUserInputValue] = useState(filters.user || "");
  const [ipInputValue, setIpInputValue] = useState(filters.ip || "");
  const [resetDatePicker, setResetDatePicker] = useState(false);

  // Get unique events from logs for the dropdown
  const uniqueEvents = logs?.length 
    ? [...new Set(logs.map(log => log.event).filter(Boolean))].sort()
    : [];

  // Get unique labs from logs for the dropdown
  const uniqueLabs = logs?.length
    ? [...new Set(logs.map(log => log.lab).filter(Boolean))].sort()
    : [];
  
  // Reset date picker when filters are cleared
  useEffect(() => {
    if (!filters.dateRange) {
      setResetDatePicker(prev => !prev);
    }
  }, [filters.dateRange]);

  // Apply filters on input blur or Enter key press
  const handleApplyFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle date range filter
  const handleDateRangeChange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({ user: '', dateRange: '', ip: '', event: '', lab: '' });
    setUserInputValue("");
    setIpInputValue("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Filtros
          {Object.values(filters).some(Boolean) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 ml-auto" 
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <div className="relative">
              <Input
                placeholder="Filtrar por usuario..."
                value={userInputValue}
                onChange={e => setUserInputValue(e.target.value)}
                onBlur={() => handleApplyFilter("user", userInputValue)}
                onKeyDown={e => e.key === "Enter" && handleApplyFilter("user", userInputValue)}
                className="pr-8"
              />
              {userInputValue && (
                <X
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setUserInputValue("");
                    handleApplyFilter("user", "");
                  }}
                />
              )}
            </div>
          </div>

          {/* IP filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección IP</label>
            <div className="relative">
              <Input
                placeholder="Filtrar por IP..."
                value={ipInputValue}
                onChange={e => setIpInputValue(e.target.value)}
                onBlur={() => handleApplyFilter("ip", ipInputValue)}
                onKeyDown={e => e.key === "Enter" && handleApplyFilter("ip", ipInputValue)}
                className="pr-8"
              />
              {ipInputValue && (
                <X
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setIpInputValue("");
                    handleApplyFilter("ip", "");
                  }}
                />
              )}
            </div>
          </div>

          {/* Event filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Evento</label>
            <Select
              value={filters.event || ""}
              onValueChange={value => handleApplyFilter("event", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los eventos</SelectItem>
                {uniqueEvents.map(event => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lab filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Laboratorio</label>
            <Select
              value={filters.lab || ""}
              onValueChange={value => handleApplyFilter("lab", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar laboratorio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los laboratorios</SelectItem>
                {uniqueLabs.map(lab => (
                  <SelectItem key={lab} value={lab}>
                    {lab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range filter */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium">Rango de fechas</label>
            <DatePickerWithRange 
              onChange={handleDateRangeChange} 
              reset={resetDatePicker} 
            />
          </div>
        </div>

        {/* Active filters display */}
        {Object.values(filters).some(Boolean) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.user && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Usuario: {filters.user}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setUserInputValue("");
                    handleApplyFilter("user", "");
                  }}
                />
              </Badge>
            )}
            {filters.ip && (
              <Badge variant="secondary" className="flex items-center gap-1">
                IP: {filters.ip}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setIpInputValue("");
                    handleApplyFilter("ip", "");
                  }}
                />
              </Badge>
            )}
            {filters.event && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Evento: {filters.event}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleApplyFilter("event", "")}
                />
              </Badge>
            )}
            {filters.lab && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Laboratorio: {filters.lab}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleApplyFilter("lab", "")}
                />
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Fechas: {filters.dateRange.from.toLocaleDateString()} - {filters.dateRange.to.toLocaleDateString()}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleApplyFilter("dateRange", "")}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
