import {useCallback, useMemo, useState} from 'react';

export function useUserTableFilters(users) {
    const [filter, setFilter] = useState("");
    const [selectedCarreras, setSelectedCarreras] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    // Available carreras based on current filters
    const availableCarreras = useMemo(() => {
        const carreras = Array.isArray(users)
            ? users
                .filter((user) =>
                    selectedGroups.length === 0 || 
                    (user.groups && user.groups.some(group => selectedGroups.includes(group)))
                )
                .map((user) => user.ou)
                .filter(Boolean)
            : [];
        return [...new Set(carreras)];
    }, [users, selectedGroups]);

    // Available groups based on current filters
    const availableGroups = useMemo(() => {
        const groups = Array.isArray(users)
            ? users
                .filter((user) =>
                    selectedCarreras.length === 0 || selectedCarreras.includes(user.ou)
                )
                .flatMap((user) => user.groups || [])
            : [];
        return [...new Set(groups)];
    }, [users, selectedCarreras]);

    const toggleCarrera = useCallback((carrera) => {
        setSelectedCarreras((prev) =>
            prev.includes(carrera) ? prev.filter((c) => c !== carrera) : [...prev, carrera]
        );
    }, []);

    const toggleGroup = useCallback((group) => {
        setSelectedGroups((prev) =>
            prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
        );
    }, []);

    const clearCarreraFilter = useCallback(() => {
        setSelectedCarreras([]);
    }, []);

    const clearGroupFilter = useCallback(() => {
        setSelectedGroups([]);
    }, []);

    return {
        filter,
        setFilter,
        selectedCarreras,
        setSelectedCarreras,
        selectedGroups,
        setSelectedGroups,
        toggleCarrera,
        toggleGroup,
        clearCarreraFilter,
        clearGroupFilter,
        availableCarreras,
        availableGroups
    };
}
