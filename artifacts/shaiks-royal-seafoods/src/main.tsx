import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Inject JWT from localStorage into every API request
setAuthTokenGetter(() => localStorage.getItem('auth_token'));

createRoot(document.getElementById('root')!).render(<App />);
