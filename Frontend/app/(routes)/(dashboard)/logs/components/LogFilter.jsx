"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function LogFilter({ logs, filters, setFilters }) {
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [openGroups, setOpenGroups] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract unique values from logs with error handling
  const uniqueUsers = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return [...new Set(logs.map(log => log?.user).filter(Boolean))].sort();
  }, [logs]);
  
  const uniqueEvents = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return [...new Set(logs.map(log => log?.event).filter(Boolean))].sort();
  }, [logs]);

  const uniqueLabs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return [...new Set(logs.map(log => log?.lab).filter(Boolean))].sort();
  }, [logs]);
  
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
    // Ensure we have valid date objects before setting state
    if (range?.from && range?.to) {
      try {
        // Make sure both dates are valid
        const from = range.from instanceof Date ? range.from : new Date(range.from);
        const to = range.to instanceof Date ? range.to : new Date(range.to);
        
        // Validate dates
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          console.error("Invalid date in range:", range);
          return;
        }
        
        setFilters(prev => ({ 
          ...prev, 
          dateRange: { 
            from, 
            to 
          } 
        }));
      } catch (error) {
        console.error("Error setting date range:", error);
      }
    } else {
      // Handle clearing the date range
      setFilters(prev => ({ ...prev, dateRange: null }));
    }
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
    setSearchQuery("");
  };
  
  const applyFilters = () => {
    // This will close the dialog and keep the current filters
    setOpenFiltersDialog(false);
  };

  // Filter items by search term
  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.users?.length || 0) + 
    (filters.events?.length || 0) + 
    (filters.labs?.length || 0) + 
    (filters.ip ? 1 : 0) + 
    (filters.dateRange ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Compact filter button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 relative">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-3" align="start" sideOffset={4}>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm font-medium">Filtros rápidos</span>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                >
                  Limpiar todos
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {/* Date filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 px-3 hover:bg-accent"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="flex-grow text-left">Fecha</span>
                    {filters.dateRange && (
                      <Badge className="ml-auto bg-primary text-xs" variant="default">
                        Activo
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" side="right">
                  <DatePickerWithRange
                    onChange={handleDateRangeChange}
                    reset={resetDatePicker}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
              
              {/* Users filter */}
              <Popover open={openUsers} onOpenChange={setOpenUsers}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 px-3 hover:bg-accent"
                  >
                    <Users className="h-4 w-4" />
                    <span className="flex-grow text-left">Usuarios</span>
                    {filters.users?.length > 0 && (
                      <Badge className="ml-auto bg-primary text-xs" variant="default">
                        {filters.users.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." />
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
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
              
              {/* Events filter */}
              <Popover open={openEvents} onOpenChange={setOpenEvents}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 px-3 hover:bg-accent"
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="flex-grow text-left">Eventos</span>
                    {filters.events?.length > 0 && (
                      <Badge className="ml-auto bg-primary text-xs" variant="default">
                        {filters.events.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar evento..." />
                    <CommandEmpty>No se encontraron eventos.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
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
              
              {/* IP filter */}
              <div className="px-1 py-1">
                <Input
                  placeholder="Dirección IP..."
                  value={filters.ip || ""}
                  onChange={e => setFilters(prev => ({ ...prev, ip: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              
              {/* Advanced filters button */}
              <Button 
                variant="outline"
                size="sm" 
                className="w-full mt-2"
                onClick={() => setOpenFiltersDialog(true)}
              >
                <Sliders className="mr-1 h-3.5 w-3.5" />
                Más filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      <div className="flex flex-wrap items-center gap-1">
        {filters.dateRange && (
          <Badge variant="secondary" className="h-8 px-3 gap-1 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {format(new Date(filters.dateRange.from), 'dd/MM/yyyy', { locale: es })} - 
            {format(new Date(filters.dateRange.to), 'dd/MM/yyyy', { locale: es })}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
            />
          </Badge>
        )}
        
        {filters.users?.length > 0 && (
          <Badge variant="secondary" className="h-8 px-3 gap-1 text-xs">
            <Users className="h-3 w-3" />
            {filters.users.length} {filters.users.length === 1 ? 'usuario' : 'usuarios'}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => handleClearFilter('users')}
            />
          </Badge>
        )}
        
        {filters.events?.length > 0 && (
          <Badge variant="secondary" className="h-8 px-3 gap-1 text-xs">
            <BarChart className="h-3 w-3" />
            {filters.events.length} {filters.events.length === 1 ? 'evento' : 'eventos'}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => handleClearFilter('events')}
            />
          </Badge>
        )}
        
        {filters.labs?.length > 0 && (
          <Badge variant="secondary" className="h-8 px-3 gap-1 text-xs">
            <FolderInput className="h-3 w-3" />
            {filters.labs.length} {filters.labs.length === 1 ? 'lab' : 'labs'}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => handleClearFilter('labs')}
            />
          </Badge>
        )}
        
        {filters.ip && (
          <Badge variant="secondary" className="h-8 px-3 gap-1 text-xs">
            <Network className="h-3 w-3" />
            IP: {filters.ip}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => handleClearFilter('ip')}
            />
          </Badge>
        )}
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAllFilters}
            className="h-8 px-3 text-xs hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar todo
          </Button>
        )}
      </div>
      
      {/* Advanced filters dialog */}
      <Dialog open={openFiltersDialog} onOpenChange={setOpenFiltersDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5" /> Filtros avanzados
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Usuarios
                </label>
                <div className="border rounded-md">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Buscar usuario..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="max-h-[180px] overflow-y-auto p-1">
                    {filterItems(uniqueUsers, searchQuery).length > 0 ? (
                      filterItems(uniqueUsers, searchQuery).map(user => (
                        <div 
                          key={user}
                          className={cn(
                            "flex items-center px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer",
                            filters.users?.includes(user) && "bg-muted"
                          )}
                          onClick={() => handleToggleSelection('users', user)}
                        >
                          <div className={cn(
                            "h-4 w-4 border rounded-sm mr-2 flex items-center justify-center",
                            filters.users?.includes(user) && "bg-primary border-primary"
                          )}>
                            {filters.users?.includes(user) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm">{user}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No se encontraron usuarios
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FolderInput className="h-4 w-4" /> Laboratorios
                </label>
                <div className="border rounded-md max-h-[180px] overflow-y-auto p-1">
                  {uniqueLabs.length > 0 ? (
                    uniqueLabs.map(lab => (
                      <div 
                        key={lab}
                        className={cn(
                          "flex items-center px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer",
                          filters.labs?.includes(lab) && "bg-muted"
                        )}
                        onClick={() => handleToggleSelection('labs', lab)}
                      >
                        <div className={cn(
                          "h-4 w-4 border rounded-sm mr-2 flex items-center justify-center",
                          filters.labs?.includes(lab) && "bg-primary border-primary"
                        )}>
                          {filters.labs?.includes(lab) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm">{lab}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No hay laboratorios disponibles
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BarChart className="h-4 w-4" /> Eventos
                </label>
                <div className="border rounded-md max-h-[180px] overflow-y-auto p-1">
                  {uniqueEvents.length > 0 ? (
                    uniqueEvents.map(event => (
                      <div 
                        key={event}
                        className={cn(
                          "flex items-center px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer",
                          filters.events?.includes(event) && "bg-muted"
                        )}
                        onClick={() => handleToggleSelection('events', event)}
                      >
                        <div className={cn(
                          "h-4 w-4 border rounded-sm mr-2 flex items-center justify-center",
                          filters.events?.includes(event) && "bg-primary border-primary"
                        )}>
                          {filters.events?.includes(event) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm">{event}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No hay eventos disponibles
                    </div>
                  )}
                </div>
              </div>
              
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Rango de fechas
                </label>
                <div className="z-50"> {/* Add higher z-index */}
                  <DatePickerWithRange
                    onChange={handleDateRangeChange}
                    reset={resetDatePicker}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={handleClearAllFilters}>
              Limpiar filtros
            </Button>
            <Button onClick={applyFilters}>
              Aplicar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
