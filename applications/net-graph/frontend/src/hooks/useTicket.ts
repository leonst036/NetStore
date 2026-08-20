import { useMemo } from 'react';

export function useTicket(): string {
    return useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ticket') || '';
    }, []);
}
