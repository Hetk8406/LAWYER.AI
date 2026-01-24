import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
// Using standard characters/simple layout to avoid potential icon crashes initially
// We can re-introduce icons carefully later.

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-dark);
  color: var(--text-main);
`;

const Sidebar = styled.div`
  width: 260px;
  background-color: var(--bg-panel);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.3s;
  border-right: 1px solid var(--border);

  @media (max-width: 768px) {
    width: ${props => props.isOpen ? '260px' : '0'};
    overflow: hidden;
  }
`;

const SidebarHeader = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--border);
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: var(--primary);
`;

const NavList = styled.nav`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border);
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: ${props => props.active ? 'var(--text-main)' : 'var(--text-secondary)'};
  background-color: ${props => props.active ? 'var(--primary)' : 'transparent'};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.95rem;

  &:hover {
    color: var(--text-main);
    background-color: var(--glass);
  }

  span.icon {
    margin-right: 12px;
    font-size: 1.1rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const Topbar = styled.header`
  background-color: var(--bg-panel);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid var(--border);
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  color: var(--text-main);

  @media (max-width: 768px) {
    display: block;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-main);
`;

const LogoutButton = styled.button`
  width: 100%;
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;

  &:hover {
    background-color: #ef4444;
    color: white;
  }
`;

const ContentArea = styled.main`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'User Management', path: '/admin/users', icon: '👥' },
    { label: 'Lawyers', path: '/admin/lawyers', icon: '⚖️' },
    { label: 'Blogs', path: '/admin/blogs', icon: '📝' },
    { label: 'Contacts', path: '/admin/contacts', icon: '📞' },
  ];

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>LAW AI ADMIN</SidebarHeader>
        <NavList>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path ? 1 : 0}
              onClick={() => setSidebarOpen(false)} // Close on mobile on click
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavItem>
          ))}
        </NavList>
        <SidebarFooter>
          <LogoutButton onClick={handleLogout}>
            <span>🚪</span> Logout
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Topbar>
          <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>☰</MenuButton>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h3>
          <UserMenu>
            <span>{user?.name || 'Admin'}</span>
          </UserMenu>
        </Topbar>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
