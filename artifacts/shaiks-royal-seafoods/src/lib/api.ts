import { useState, useEffect } from 'react';
// Empty file just to resolve api issues while I configure api-client wrapper
export const apiFetch = async (url: string, options: any) => {
    return fetch(url, options);
}
