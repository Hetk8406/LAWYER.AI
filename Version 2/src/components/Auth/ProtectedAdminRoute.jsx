import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== 'admin') {
        // Redirect non-admins to their dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
