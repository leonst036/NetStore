import { useState, useEffect } from 'react';
import { type TabId } from '../types/settings';

export const useUsers = (ticket: string, activeTab: TabId, canManageUsers: boolean) => {
    if (!canManageUsers || activeTab !== 'users') return;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Ticket ${ticket}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (user: any) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Ticket ${ticket}`
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (data.success) {
                fetchUsers();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateUser = async (user: any) => {
        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Ticket ${ticket}`
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (data.success) {
                fetchUsers();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Ticket ${ticket}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchUsers();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser
    };
}