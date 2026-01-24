import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignupPage from './pages/Auth/LoginSignupPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import FeaturesPage from './pages/Dashboard/FeaturesPage';
import AboutPage from './pages/Dashboard/AboutPage';
import ContactPage from './pages/Dashboard/ContactPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import ChatPage from './pages/Dashboard/ChatPage';
import BlogPage from './pages/Dashboard/Blog/BlogPage';
import IPCPage from './pages/Dashboard/IPC/IPCPage';
import BlogCreate from './pages/Dashboard/Blog/BlogCreate';
import BlogEdit from './pages/Dashboard/Blog/BlogEdit';
import BlogDetail from './pages/Dashboard/Blog/BlogDetail';
import CourtroomPage from './pages/Dashboard/Courtroom/CourtroomPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import LawyerManagement from './pages/Admin/LawyerManagement';
import BlogManagement from './pages/Admin/BlogManagement';
import ContactManagement from './pages/Admin/ContactManagement';
import ProtectedAdminRoute from './components/Auth/ProtectedAdminRoute';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import './index.css';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';

import ScrollToTop from './components/Common/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SocketProvider>
              <ChatProvider>
                <DashboardLayout />
              </ChatProvider>
            </SocketProvider>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="chat" element={<ChatPage />} />



          {/* Blog Routes - Blocked for Civilians */}
          <Route path="blog" element={
            <RoleProtectedRoute allowedRoles={['lawyer', 'law_student', 'admin']}>
              <BlogPage />
            </RoleProtectedRoute>
          } />
          <Route path="blog/create" element={
            <RoleProtectedRoute allowedRoles={['lawyer']}>
              <BlogCreate />
            </RoleProtectedRoute>
          } />
          <Route path="blog/edit/:id" element={
            <RoleProtectedRoute allowedRoles={['lawyer']}>
              <BlogEdit />
            </RoleProtectedRoute>
          } />
          <Route path="blog/:id" element={
            <RoleProtectedRoute allowedRoles={['lawyer', 'law_student', 'admin']}>
              <BlogDetail />
            </RoleProtectedRoute>
          } />

          {/* Courtroom Route - Blocked for Law Students */}
          <Route path="courtroom" element={
            <RoleProtectedRoute allowedRoles={['lawyer', 'civilian', 'admin']}>
              <CourtroomPage />
            </RoleProtectedRoute>
          } />
          <Route path="ipc" element={<IPCPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="lawyers" element={<LawyerManagement />} />
          <Route path="blogs" element={<BlogManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
