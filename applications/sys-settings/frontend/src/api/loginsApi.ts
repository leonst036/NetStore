import { ServerLogin } from '../types/login';
import { apiRequest } from './client';

export const fetchLogins = async (ticket: string): Promise<ServerLogin[]> => {
    try {
        const res = await apiRequest<ServerLogin[]>(ticket, '/api/server-logins');
        return res;
    } catch (error) {
        console.error('Failed to fetch logins', error);
        return [];
    }
}

export const saveLogin = async (ticket: string, login: ServerLogin): Promise<void> => {
    try {
        await apiRequest<void>(ticket, '/api/server-logins', { method: 'POST', body: login });
    } catch (error) {
        console.error('Failed to save login', error);
    }
};

export const deleteLogin = async (ticket: string, id: string): Promise<void> => {
    try {
        await apiRequest<void>(ticket, `/api/server-logins/${id}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Failed to delete login', error);
    }
};