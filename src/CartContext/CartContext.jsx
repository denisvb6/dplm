import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        setCartItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.id === product.id && item.type === product.type
            );

            if (existingItem) {
                return currentItems.map((item) =>
                    item.id === product.id && item.type === product.type
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...currentItems,
                { ...product, cartId: crypto.randomUUID(), quantity: 1 }
            ];
        });
    };

    const removeFromCart = (cartId) => {
        setCartItems((currentItems) =>
            currentItems.filter((item) => item.cartId !== cartId)
        );
    };

    const clearCart = () => setCartItems([]);

    const createOrder = async () => {
        if (cartItems.length === 0) {
            throw new Error('Корзина пуста');
        }

        const items = cartItems.map((item) => ({
            productId: Number(item.id),
            productType: item.type,
            title: item.title,
            price: Number(item.price),
            quantity: Number(item.quantity),
            poster: item.poster
        }));

        let response;
        try {
            response = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include', // ← cookie с access-токеном
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }) // total считает сервер
            });
        } catch (error) {
            console.error('Backend недоступен:', error);
            throw new Error('Не удалось подключиться к серверу');
        }

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            throw new Error('Войдите в аккаунт, чтобы оформить заказ');
        }
        if (!response.ok) {
            throw new Error(data.message || 'Ошибка создания заказа');
        }

        setCartItems([]);
        return data;
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
                createOrder
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context)
        throw new Error('useCart должен использоваться внутри CartProvider');
    return context;
};
