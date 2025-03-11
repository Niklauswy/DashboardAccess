"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, Filter, Sliders, X, Calendar as CalendarIcon, Users, Building, Group, FolderInput, BarChart, Network } from "lucide-react";
import { cn } from "@/components/lib/utils";
import DatePickerWithRange from "./DatePickerWithRange";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LogFilter({ logs, filters, setFilters }) {
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  
  // Extract unique values from logs
  const uniqueUsers = logs?.length 
    ? [...new Set(logs.map(log => log.user).filter(Boolean))].sort()
    : [];
  
  const uniqueOUs = logs?.length 
    ? [...new Set(logs.map(log => log.ou).filter(Boolean))].sort()
    : [];
    
  const uniqueGroups = logs?.length 
    ? [...new Set(logs.map(log => log.groups || []).flat().filter(Boolean))].sort()
    : [];
  
  const uniqueEvents = logs?.length 
    ? [...new Set(logs.map(log => log.event).filter(Boolean))].sort()
    : [];

  const uniqueLabs = logs?.length
    ? [...new Set(logs.map(log => log.lab).filter(Boolean))].sort()
    : [];
  
  // Reset date picker when filters are cleared
  useEffect(() => {
    if (!filters.dateRange) {
      setResetDatePicker(prev => !prev);
    }
  }, [filters.dateRange]);

  // Handle multi-selection toggles
  const handleToggleSelection = (field, value) => {
    setFilters(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [field]: newValues };
    });
  };

  // Clear single filter
  const handleClearFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: Array.isArray(prev[field]) ? [] : '' }));
  };

  // Handle date range filter
  const handleDateRangeChange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({ 
      users: [], 
      ous: [], 
      groups: [], 
      dateRange: null, 
      events: [], 
      labs: [],
      ip: ''
    });
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.users?.length || 0) + 
    (filters.ous?.length || 0) + 
    (filters.groups?.length || 0) + 
    (filters.events?.length || 0) + 
    (filters.labs?.length || 0) + 
    (filters.ip ? 1 : 0) + 
    (filters.dateRange ? 1 : 0);

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Compact filter button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-primary/20 text-primary border-none h-5 px-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-2" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium">Filtros rápidos</span>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 px-2 text-xs"
                >
                  Limpiar todos
                </Button>
              )}
            </div>
            
            <div className="space-y-1">
              {/* Date filter */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => setOpenFiltersDialog(true)}
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Fecha</span>
                {filters.dateRange && (
                  <Badge className="ml-auto bg-primary/20 text-primary border-none h-5">
                    Activo
                  </Badge>
                )}
              </Button>
              
              {/* Users filter */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => setOpenFiltersDialog(true)}
              >
                <Users className="h-4 w-4" />
                <span>Usuarios</span>
                {filters.users?.length > 0 && (
                  <Badge className="ml-auto bg-primary/20 text-primary border-none h-5">
                    {filters.users.length}
                  </Badge>
                )}
              </Button>
              
              {/* Events filter */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => setOpenFiltersDialog(true)}
              >
                <BarChart className="h-4 w-4" />
                <span>Eventos</span>
                {filters.events?.length > 0 && (
                  <Badge className="ml-auto bg-primary/20 text-primary border-none h-5">
                    {filters.events.length}
                  </Badge>
                )}
              </Button>
              
              {/* IP filter */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => setOpenFiltersDialog(true)}
              >
                <Network className="h-4 w-4" />
                <span>Dirección IP</span>
                {filters.ip && (
                  <Badge className="ml-auto bg-primary/20 text-primary border-none h-5">
                    Activo
                  </Badge>
                )}
              </Button>
              
              <div className="pt-1 border-t">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="w-full text-center flex items-center justify-center mt-1"
                  onClick={() => setOpenFiltersDialog(true)}
                >
                  <Sliders className="mr-1 h-3.5 w-3.5" />
                  Todos los filtros
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {filters.dateRange && (
            <Badge variant="secondary" className="h-9 px-3 gap-2 text-xs">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(filters.dateRange.from), 'dd/MM/yyyy', { locale: es })} - 
              {format(new Date(filters.dateRange.to), 'dd/MM/yyyy', { locale: es })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
              />
            </Badge>
          )}
          
          {filters.users?.length > 0 && (
            <Badge variant="secondary" className="h-9 px-3 gap-2 text-xs">
              <Users className="h-3 w-3" />
              {filters.users.length} usuarios
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('users')}
              />
            </Badge>
          )}
          
          {filters.ous?.length > 0 && (
            <Badge variant="secondary" className="h-9 px-3 gap-2 text-xs">
              <Building className="h-3 w-3" />
              {filters.ous.length} carreras
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('ous')}
              />
            </Badge>
          )}
          
          {filters.events?.length > 0 && (
            <Badge variant="secondary" className="h-9 px-3 gap-2 text-xs">
              <BarChart className="h-3 w-3" />
              {filters.events.length} eventos
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('events')}
              />
            </Badge>
          )}
          
          {filters.ip && (
            <Badge variant="secondary" className="h-9 px-3 gap-2 text-xs">
              <Network className="h-3 w-3" />
              IP: {filters.ip}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('ip')}
              />
            </Badge>
          )}
          
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAllFilters}
              className="h-7 px-3 text-xs"
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}
      
      {/* Full filter dialog */}
      <Dialog open={openFiltersDialog} onOpenChange={setOpenFiltersDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filtros avanzados
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Users filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Usuarios
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {filters.users?.length 
                      ? `${filters.users.length} usuarios seleccionados` 
                      : "Seleccionar usuarios"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." />
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {uniqueUsers.map(user => (
                        <CommandItem
                          key={user}
                          value={user}
                          onSelect={() => handleToggleSelection('users', user)}
                        >
                          <Check className={cn(
                            "mr-2 h-4 w-4",
                            filters.users?.includes(user) ? "opacity-100" : "opacity-0"
                          )} />
                          {user}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Events filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4" /> Eventos
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {filters.events?.length 
                      ? `${filters.events.length} eventos seleccionados` 
                      : "Seleccionar eventos"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar evento..." />
                    <CommandEmpty>No se encontraron eventos.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {uniqueEvents.map(event => (
                        <CommandItem
                          key={event}
                          value={event}
                          onSelect={() => handleToggleSelection('events', event)}
                        >
                          <Check className={cn(
                            "mr-2 h-4 w-4",
                            filters.events?.includes(event) ? "opacity-100" : "opacity-0"
                          )} />
                          {event}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Date range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Rango de fechas
              </label>
              <DatePickerWithRange
                onChange={handleDateRangeChange}
                reset={resetDatePicker}
              />
            </div>
            
            {/* IP filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4" /> Dirección IP
              </label>
              <div className="relative">
                <Input
                  placeholder="Filtrar por IP..."
                  value={filters.ip || ""}
                  onChange={e => setFilters(prev => ({ ...prev, ip: e.target.value }))}
                />
                {filters.ip && (
                  <X
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setFilters(prev => ({ ...prev, ip: "" }))}
                  />
                )}
              </div>
            </div>
            
            {/* Additional filters can go here */}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClearAllFilters}>
              Limpiar todos
            </Button>
            <Button onClick={() => setOpenFiltersDialog(false)}>
              Aplicar filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
