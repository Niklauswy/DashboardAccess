'use client';
import useSWR from 'swr';
import { useState, useMemo, useCallback } from 'react';
import UserTable from '@/components/UserTable';
import UserTableSkeleton from '@/components/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';
import NoData from '@/components/NoData';
import UserFilters from '@/components/UserFilters';

export default function UsersPage() {
    const fetcher = url => fetch(url, { cache: 'no-store' }).then(res => res.json());
    const { data: users, error, mutate } = useSWR('/api/users', fetcher, { refreshInterval: 0 });

    async function fetchUsersData() {
        await mutate();
    }

    const [filter, setFilter] = useState("");
    const [selectedCarreras, setSelectedCarreras] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    const toggleCarrera = useCallback(carrera => {
      setSelectedCarreras(prev => prev.includes(carrera) ? prev.filter(c => c !== carrera) : [...prev, carrera]);
    }, []);
    const toggleGroup = useCallback(group => {
      setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
    }, []);
    const clearCarreraFilter = useCallback(() => setSelectedCarreras([]), []);
    const clearGroupFilter = useCallback(() => setSelectedGroups([]), []);
    
    // Filtrado de datos en Page
    const filteredUsers = useMemo(() => {
      if (!users) return [];
      return users.filter(user =>
        (selectedCarreras.length === 0 || selectedCarreras.includes(user.ou)) &&
        (selectedGroups.length === 0 || (user.groups && user.groups.some(g => selectedGroups.includes(g)))) &&
        Object.values(user).some(val => String(val).toLowerCase().includes(filter.toLowerCase()))
      );
    }, [users, filter, selectedCarreras, selectedGroups]);
    
    if (error) return <ErrorServer message="Error al cargar los usuarios" onRetry={fetchUsersData} />;
    if (!users) return <UserTableSkeleton />;
    if (users.length === 0) return <NoData />;
    
    return (
      <div>
        <UserFilters
          users={users}
          filter={filter}
          setFilter={setFilter}
          selectedCarreras={selectedCarreras}
          toggleCarrera={toggleCarrera}
          clearCarreraFilter={clearCarreraFilter}
          selectedGroups={selectedGroups}
          toggleGroup={toggleGroup}
          clearGroupFilter={clearGroupFilter}
        />
        <UserTable users={filteredUsers} refreshUsers={fetchUsersData} />
      </div>
    );
}
