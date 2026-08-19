export interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T>(
    ticket: string,
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { body, params, headers = {}, ...customConfig } = options;

    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...(ticket ? { Authorization: `Ticket ${ticket}` } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
    };

    if (body !== undefined) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return undefined as T;
}

export const createApiClient = (ticket: string) => ({
    get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
        apiRequest<T>(ticket, endpoint, { method: 'GET', params }),
    post: <T>(endpoint: string, body?: unknown) =>
        apiRequest<T>(ticket, endpoint, { method: 'POST', body }),
    put: <T>(endpoint: string, body?: unknown) =>
        apiRequest<T>(ticket, endpoint, { method: 'PUT', body }),
    delete: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
        apiRequest<T>(ticket, endpoint, { method: 'DELETE', params }),
});
