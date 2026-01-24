import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* Use fixed height 100vh for app-like pages to prevent window scroll */
  height: ${props => props.$isFixed ? '100vh' : 'auto'};
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-main);
  overflow: ${props => props.$isFixed ? 'hidden' : 'visible'};
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FullWidthContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const DashboardLayout = () => {
  const location = useLocation();
  // Check if current page should be full width (Chat or Courtroom)
  const isFullWidthPage = ['/dashboard/chat', '/dashboard/courtroom', '/dashboard/ipc'].includes(location.pathname);

  return (
    <LayoutContainer $isFixed={isFullWidthPage}>
      <Navbar />

      {isFullWidthPage ? (
        <FullWidthContent>
          <Outlet />
        </FullWidthContent>
      ) : (
        <MainContent>
          <Outlet />
        </MainContent>
      )}

      <Footer />
    </LayoutContainer>
  );
};

export default DashboardLayout;
