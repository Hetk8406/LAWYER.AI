import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = '/api/auth';

    // Check if user is logged in on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // axios defaults handled in utils/axios.js interceptor, but we can set state if needed
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post(`${API_BASE_URL}/login`, { email, password });

            if (response.data.status === 'success') {
                const { token, data } = response.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // axios defaults handled in utils/axios.js
                return { success: true, user: data.user };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Login Error", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    const signup = async (formData) => {
        try {
            const response = await api.post(`${API_BASE_URL}/signup`, formData);
            if (response.data.status === 'success') {
                const { token, data } = response.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Signup Error", error);
            return {
                success: false,
                message: error.response?.data?.message || "Signup failed"
            };
        }
    };

    const googleLogin = async (userInfo) => {
        try {
            const response = await api.post(`${API_BASE_URL}/google`, userInfo);

            if (response.data.status === 'success') {
                const { token, data } = response.data;
                setToken(token);
                setUser(data.user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Google Login Context Error", error);
            return {
                success: false,
                message: error.response?.data?.message || "Google Login failed"
            };
        }
    };

    const updateProfile = async (formData) => {
        try {
            const response = await api.put(`${API_BASE_URL}/profile`, formData);
            if (response.data.status === 'success') {
                const updatedUser = response.data.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
                return { success: true, user: updatedUser };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Update Profile Error", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update profile."
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // axios defaults handled in utils/axios.js
    };

    // Helper to manually update user state (e.g. after image upload)
    const updateUserState = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, googleLogin, updateProfile, updateUserState, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
