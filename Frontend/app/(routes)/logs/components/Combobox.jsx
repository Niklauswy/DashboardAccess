"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react"; // Importa el ícono que prefieras
import { cn } from "@/components/lib/utils";

const Combobox = ({ options, placeholder, onChange, value, icon: Icon }) => {
  const [inputValue, setInputValue] = React.useState(value || "");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {/* Aquí se agrega el ícono */}
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {inputValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`${placeholder}...`}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
          />
          <CommandList>
            <CommandEmpty>No se encontró tal {placeholder}.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map(option => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === inputValue ? "" : currentValue;
                    setInputValue(newValue);
                    onChange(newValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      inputValue === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
