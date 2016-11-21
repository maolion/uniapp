import fetch from '../libs/fetch';

export function get(url: string, data?: any) {
    return fetch(url, { body: data, method: 'GET' });
}

export function post(url: string, data?: any) {
    return fetch(url, { body: data, method: 'POST' });
}

export function patch(url: string, data?: any) {
    return fetch(url, { body: data, method: 'PATCH' }); 
}

export function del(url: string, data?: any) {
    return fetch(url, { body: data, method: 'DELETE' });
}
