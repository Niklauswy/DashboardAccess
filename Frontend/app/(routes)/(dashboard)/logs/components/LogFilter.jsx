"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, Filter, Search, X } from "lucide-react";
import { cn } from "@/components/lib/utils";
import DatePickerWithRange from "./DatePickerWithRange";

export default function LogFilter({ logs, filters, setFilters }) {
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [openUsers, setOpenUsers] = useState(false);
  const [openOUs, setOpenOUs] = useState(false);
  const [openGroups, setOpenGroups] = useState(false);
  
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
    setFilters(prev => ({ ...prev, [field]: [] }));
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
      dateRange: '', 
      events: [], 
      labs: [] 
    });
    setSearchInput("");
  };

  // Filter items by search input
  const filterItems = (items, search) => {
    if (!search) return items;
    return items.filter(item => 
      item.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {Object.values(filters).some(val => 
            Array.isArray(val) ? val.length > 0 : Boolean(val)
          ) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 ml-auto" 
              onClick={handleClearAllFilters}
            >
              Limpiar todos los filtros
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users Multi-select Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuarios</label>
            <Popover open={openUsers} onOpenChange={setOpenUsers}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUsers}
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
                  <CommandInput 
                    placeholder="Buscar usuario..."
                    value={searchInput}
                    onValueChange={setSearchInput}
                  />
                  <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {filterItems(uniqueUsers, searchInput).map(user => (
                      <CommandItem
                        key={user}
                        value={user}
                        onSelect={() => handleToggleSelection('users', user)}
                      >
                        <span className="mr-2">
                          {filters.users?.includes(user) ? 
                            <Check className="h-4 w-4" /> : 
                            <div className="h-4 w-4" />}
                        </span>
                        {user}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.users?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.users.slice(0, 3).map(user => (
                  <Badge key={user} variant="secondary" className="text-xs">
                    {user.length > 15 ? `${user.substring(0, 13)}...` : user}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleSelection('users', user)} 
                    />
                  </Badge>
                ))}
                {filters.users.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{filters.users.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* OUs Multi-select Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Carreras</label>
            <Popover open={openOUs} onOpenChange={setOpenOUs}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOUs}
                  className="w-full justify-between"
                >
                  {filters.ous?.length 
                    ? `${filters.ous.length} carreras seleccionadas` 
                    : "Seleccionar carreras"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar carrera..." />
                  <CommandEmpty>No se encontraron carreras.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {uniqueOUs.map(ou => (
                      <CommandItem
                        key={ou}
                        value={ou}
                        onSelect={() => handleToggleSelection('ous', ou)}
                      >
                        <span className="mr-2">
                          {filters.ous?.includes(ou) ? 
                            <Check className="h-4 w-4" /> : 
                            <div className="h-4 w-4" />}
                        </span>
                        {ou}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.ous?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.ous.map(ou => (
                  <Badge key={ou} variant="secondary" className="text-xs">
                    {ou}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleSelection('ous', ou)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Groups Multi-select Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Grupos</label>
            <Popover open={openGroups} onOpenChange={setOpenGroups}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openGroups}
                  className="w-full justify-between"
                >
                  {filters.groups?.length 
                    ? `${filters.groups.length} grupos seleccionados` 
                    : "Seleccionar grupos"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar grupo..." />
                  <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {uniqueGroups.map(group => (
                      <CommandItem
                        key={group}
                        value={group}
                        onSelect={() => handleToggleSelection('groups', group)}
                      >
                        <span className="mr-2">
                          {filters.groups?.includes(group) ? 
                            <Check className="h-4 w-4" /> : 
                            <div className="h-4 w-4" />}
                        </span>
                        {group}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.groups?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.groups.slice(0, 3).map(group => (
                  <Badge key={group} variant="secondary" className="text-xs">
                    {group.length > 15 ? `${group.substring(0, 13)}...` : group}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleSelection('groups', group)} 
                    />
                  </Badge>
                ))}
                {filters.groups.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{filters.groups.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Event Multi-select Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Eventos</label>
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
                        <span className="mr-2">
                          {filters.events?.includes(event) ? 
                            <Check className="h-4 w-4" /> : 
                            <div className="h-4 w-4" />}
                        </span>
                        {event}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.events?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.events.map(event => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleSelection('events', event)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Lab Multi-select Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Laboratorios</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {filters.labs?.length 
                    ? `${filters.labs.length} labs seleccionados` 
                    : "Seleccionar laboratorios"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar laboratorio..." />
                  <CommandEmpty>No se encontraron laboratorios.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {uniqueLabs.map(lab => (
                      <CommandItem
                        key={lab}
                        value={lab}
                        onSelect={() => handleToggleSelection('labs', lab)}
                      >
                        <span className="mr-2">
                          {filters.labs?.includes(lab) ? 
                            <Check className="h-4 w-4" /> : 
                            <div className="h-4 w-4" />}
                        </span>
                        {lab}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {filters.labs?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.labs.map(lab => (
                  <Badge key={lab} variant="secondary" className="text-xs">
                    {lab}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleToggleSelection('labs', lab)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* IP address filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección IP</label>
            <div className="relative">
              <Input
                placeholder="Filtrar por IP..."
                value={filters.ip || ""}
                onChange={e => setFilters(prev => ({ ...prev, ip: e.target.value }))}
                className="pr-8"
              />
              {filters.ip && (
                <X
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => setFilters(prev => ({ ...prev, ip: "" }))}
                />
              )}
            </div>
          </div>

          {/* Date range filter */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Rango de fechas</label>
            <DatePickerWithRange 
              onChange={handleDateRangeChange} 
              reset={resetDatePicker} 
            />
            {filters.dateRange && (
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <span>
                  {filters.dateRange.from?.toLocaleDateString()} - {filters.dateRange.to?.toLocaleDateString()}
                </span>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 ml-2 p-0"
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active filters summary */}
        {Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : Boolean(val)) && (
          <div className="border-t mt-4 pt-3">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <Search className="mr-2 h-4 w-4" />
              Filtros aplicados:
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.users?.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {filters.users.length} usuarios
                </Badge>
              )}
              {filters.ous?.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {filters.ous.length} carreras
                </Badge>
              )}
              {filters.groups?.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {filters.groups.length} grupos
                </Badge>
              )}
              {filters.events?.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {filters.events.length} eventos
                </Badge>
              )}
              {filters.labs?.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {filters.labs.length} laboratorios
                </Badge>
              )}
              {filters.ip && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  IP: {filters.ip}
                </Badge>
              )}
              {filters.dateRange && filters.dateRange.from && filters.dateRange.to && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Fechas: {filters.dateRange.from.toLocaleDateString()} - {filters.dateRange.to.toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
