
import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import DatePickerWithRange from "./DatePickerWithRange";
import Combobox from "./Combobox";
import { User, Network, Activity } from "lucide-react";

const LogFilter = ({logs, filters, setFilters}) => {
    const [reset, setReset] = useState(false);

    const uniqueUsers = [...new Set(logs.map(log => log.user))];
    const uniqueIPs = [...new Set(logs.map(log => log.ip))];
    const uniqueEventTypes = [...new Set(logs.map(log => log.event))];

    const handleSelectChange = (name, value) => {
        setFilters(prevFilters => ({...prevFilters, [name]: value}));
    };

    const handleDateChange = (dateRange) => {
        setFilters(prevFilters => ({...prevFilters, dateRange}));
    };

    const handleClearFilters = () => {
        setFilters({user: '', dateRange: '', ip: '', event: ''});
        setReset(true);
        setTimeout(() => setReset(false), 0);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <Combobox
                    options={uniqueUsers}
                    placeholder="Usuario"
                    onChange={(value) => handleSelectChange('user', value)}
                    value={filters.user}
                     icon={User}
                />
                <Combobox
                    options={uniqueIPs}
                    placeholder="IP"
                    onChange={(value) => handleSelectChange('ip', value)}
                    value={filters.ip}
                            icon={Network}
                />
                <Combobox
                    options={uniqueEventTypes}
                    placeholder="Evento"
                    onChange={(value) => handleSelectChange('event', value)}
                    value={filters.event}
                            icon={Activity}
                />
                <DatePickerWithRange onChange={handleDateChange} reset={reset}/>
                <Button onClick={handleClearFilters}>Limpiar Filtros</Button>

            </div>
        </div>
    );
};

export default LogFilter;