import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [ready, setReady] = useState(false);

    // При старте пробуем восстановить сессию из httpOnly cookie.
    useEffect(() => {
        (async () => {
            try {
                const { user } = await api.me();
                setCurrentUser(user);
            } catch {
                try {
                    const { user } = await api.refresh();
                    setCurrentUser(user);
                } catch {
                    setCurrentUser(null);
                }
            } finally {
                setReady(true);
            }
        })();
    }, []);

    const login = async (username, password) => {
        const { user } = await api.login(username, password);
        setCurrentUser(user);
        return user;
    };

    const register = async (username, password) => {
        const { user } = await api.register(username, password);
        setCurrentUser(user);
        return user;
    };

    const logout = async () => {
        try { await api.logout(); } catch { /* ignore */ }
        setCurrentUser(null);
    };

    return (
        <UserContext.Provider value={{ currentUser, ready, login, register, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser должен использоваться внутри UserProvider');
    return ctx;
};