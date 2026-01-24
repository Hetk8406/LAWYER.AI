import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 2rem;
  color: var(--text-main);
  background: var(--bg-dark);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: var(--primary);
    color: white;
  }
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <DashboardContainer>
      <Header>
        <h1>Dashboard</h1>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <div style={{ padding: '2rem', background: 'var(--bg-panel)', borderRadius: '12px' }}>
        <h2>Welcome, {user?.name || 'User'}!</h2>
        <p>Role: {user?.role || 'Civilian'}</p>
        <p>Email: {user?.email}</p>
        <br />
        <p>This is a placeholder for the LawAI 2.0 Dashboard.</p>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
