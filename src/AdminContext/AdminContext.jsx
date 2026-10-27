import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '../UserContext/UserContext';

const AdminContext = createContext(null);

const PRODUCTS_API_URL = '/api/products';
const ORDERS_API_URL = '/api/orders';

async function request(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('Требуется авторизация');
    if (res.status === 403) throw new Error('Недостаточно прав');
    if (!res.ok) throw new Error(data.message || `Ошибка ${res.status}`);
    return data;
}

export const AdminProvider = ({ children }) => {
    const { currentUser } = useUser();
    const [adminItems, setAdminItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAdminItems = async () => {
        try {
            setLoading(true);
            setAdminItems(await request(PRODUCTS_API_URL));
        } catch (e) {
            console.error('Ошибка загрузки товаров:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            setOrders(await request(ORDERS_API_URL));
        } catch (e) {
            console.error('Ошибка загрузки заказов:', e.message);
        }
    };

    useEffect(() => {
        loadAdminItems();
        // Заказы грузим только для админа — иначе бэкенд вернёт 403.
        if (currentUser?.role === 'admin') loadOrders();
    }, [currentUser]);

    const addAdminItem = async (item) => {
        const product = {
            id: Number(item.id),
            title: item.title,
            type: item.type,
            price: Number(item.price),
            poster: item.poster,
            ...(item.rating !== undefined
                ? { rating: Number(item.rating) }
                : {})
        };
        const data = await request(PRODUCTS_API_URL, {
            method: 'POST',
            body: JSON.stringify(product)
        });
        setAdminItems((cur) => [...cur, data]);
        return data;
    };

    const updateAdminItem = async (item) => {
        const product = {
            id: Number(item.id),
            title: item.title,
            type: item.type,
            price: Number(item.price),
            poster: item.poster,
            ...(item.rating !== undefined
                ? { rating: Number(item.rating) }
                : {})
        };
        const data = await request(
            `${PRODUCTS_API_URL}/${item.type}/${item.id}`,
            {
                method: 'PUT',
                body: JSON.stringify(product)
            }
        );
        setAdminItems((cur) =>
            cur.map((p) =>
                p.type === data.type && p.id === data.id ? data : p
            )
        );
        return data;
    };

    const removeAdminItem = async (type, id) => {
        const data = await request(`${PRODUCTS_API_URL}/${type}/${id}`, {
            method: 'DELETE'
        });
        setAdminItems((cur) =>
            cur.filter((p) => !(p.type === type && p.id === Number(id)))
        );
        return data;
    };

    const updateOrder = async (orderId, updatedData) => {
        const data = await request(`${ORDERS_API_URL}/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ items: updatedData.items })
        });
        setOrders((cur) => cur.map((o) => (o._id === orderId ? data : o)));
        return data;
    };

    const removeOrderItem = async (orderId, itemIndex) => {
        const data = await request(
            `${ORDERS_API_URL}/${orderId}/items/${itemIndex}`,
            { method: 'DELETE' }
        );
        if (data.deletedOrder)
            setOrders((cur) => cur.filter((o) => o._id !== orderId));
        else
            setOrders((cur) =>
                cur.map((o) => (o._id === orderId ? data.order : o))
            );
        return data;
    };

    return (
        <AdminContext.Provider
            value={{
                adminItems,
                loading,
                loadAdminItems,
                addAdminItem,
                updateAdminItem,
                removeAdminItem,
                orders,
                loadOrders,
                updateOrder,
                removeOrderItem
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const ctx = useContext(AdminContext);
    if (!ctx)
        throw new Error('useAdmin должен использоваться внутри AdminProvider');
    return ctx;
};
