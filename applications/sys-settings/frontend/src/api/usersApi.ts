import { UserAccount } from "../types/auth";
import { apiRequest } from "./client";

export const fetchUsers = async (ticket: string): Promise<UserAccount[]> => {
    try {
        const res = await apiRequest<UserAccount[]>(ticket, '/api/users');
        return res;
    } catch (error) {
        console.error('Failed to fetch users', error);
        return [];
    }
};

export const createUser = async (ticket: string, user: UserAccount): Promise<void> => {
    try {
        await apiRequest<void>(ticket, '/api/users', { method: 'POST', body: user });
    } catch (error) {
        console.error('Failed to save user', error);
    }
};

export const deleteUser = async (ticket: string, username: string): Promise<void> => {
    try {
        await apiRequest<void>(ticket, `/api/users/${username}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Failed to delete user', error);
    }
};

export const updateUser = async (ticket: string, username: string, user: UserAccount): Promise<void> => {
    try {
        await apiRequest<void>(ticket, `/api/users/${username}`, { method: 'PUT', body: user });
    } catch (error) {
        console.error('Failed to update user', error);
    }
};