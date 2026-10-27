import { Navigate } from 'react-router-dom';
import { useUser } from '../../UserContext/UserContext';

export const ProtectedRoute = ({ children, role }) => {
    const { currentUser, ready } = useUser();
    if (!ready) return <div>Загрузка…</div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (role && currentUser.role !== role) return <Navigate to="/" replace />;
    return children;
};
