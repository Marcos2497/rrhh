import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NonEmployeeRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)'
            }}>
                Verificando permisos...
            </div>
        );
    }

    // Si el usuario es empleado, no tiene permiso para ver esta ruta
    if (user && user.esEmpleado) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default NonEmployeeRoute;
