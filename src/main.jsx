import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout/Layout.jsx';
import { Error } from './components/Error/Error.jsx';
import { LoginForm } from './components/LoginForm/LoginForm.jsx';
import { UserProvider } from './UserContext/UserContext.jsx';
import { Card } from './components/Card/Card.jsx';
import { VegetablesPage } from './components/VegetablesPage/VegetablesPage.jsx';
import { DrinksPage } from './components/DrinksPage/DrinksPage.jsx';
import { Cart } from './components/Cart/Cart.jsx';
import { CartProvider } from './CartContext/CartContext.jsx';
import { AdminProvider } from './AdminContext/AdminContext';
import { AdminPanel } from './components/AdminPanel/AdminPanel.jsx';
import { RegistrationForm } from './components/RegistrationForm/RegistrationForm.jsx';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <VegetablesPage />
            }
        ]
    },

    {
        path: 'drinks',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <DrinksPage />
            }
        ]
    },

    {
        path: 'card/:type/:id',
        element: <Card />
    },

    {
        path: 'cart/:id',
        element: <Cart />
    },

    {
        path: 'login',
        element: <LoginForm />
    },

    {
        path: 'admin',
        element: <Layout />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute role="admin">
                        <AdminPanel />
                    </ProtectedRoute>
                )
            }
        ]
    },

    {
        path: 'registration',
        element: <RegistrationForm />
    },

    {
        path: '*',
        element: <Error />
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserProvider>
            <CartProvider>
                <AdminProvider>
                    <RouterProvider router={router} />
                </AdminProvider>
            </CartProvider>
        </UserProvider>
    </StrictMode>
);
