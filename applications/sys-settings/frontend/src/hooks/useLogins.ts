import { useState, useEffect } from "react";

export const useLogins = (ticket: string) => {
    const [logins, setLogins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogins();
    }, []);

    const fetchLogins = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/logins', {
                headers: { 'Authorization': `Ticket ${ticket}` }
            });
            const data = await response.json();
            if (data.success) {
                setLogins(data.logins);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addLogin = async (login: any) => {
        try {
            const response = await fetch('/api/logins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Ticket ${ticket}`
                },
                body: JSON.stringify(login)
            });
            const data = await response.json();
            if (data.success) {
                fetchLogins();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateLogin = async (login: any) => {
        try {
            const response = await fetch('/api/logins', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Ticket ${ticket}`
                },
                body: JSON.stringify(login)
            });
            const data = await response.json();
            if (data.success) {
                fetchLogins();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteLogin = async (id: string) => {
        try {
            const response = await fetch(`/api/logins/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Ticket ${ticket}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchLogins();
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        logins,
        loading,
        error,
        fetchLogins,
        addLogin,
        updateLogin,
        deleteLogin
    };
}