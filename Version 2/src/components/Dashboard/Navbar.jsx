import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaXmark, FaRightFromBracket, FaUser } from 'react-icons/fa6';

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(26, 29, 45, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  cursor: pointer;
  
  span {
    color: var(--text-main);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledLink = styled(NavLink)`
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
  position: relative;

  &:hover {
    color: var(--text-main);
  }

  &.active {
    color: var(--primary);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
  border: 1px solid rgba(255, 77, 77, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 77, 77, 0.2);
    transform: translateY(-1px);
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 70%;
  height: 100vh;
  background: var(--bg-panel);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
  z-index: 1001;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  transition: opacity 0.3s;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 60px;
  right: 2rem;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.5rem;
  width: 200px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: var(--bg-panel);
    border-left: 1px solid var(--border);
    border-top: 1px solid var(--border);
    transform: rotate(45deg);
  }
`;

const DropdownItem = styled.div`
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-main);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: rgba(255,255,255,0.05);
    color: var(--primary);
  }

  &.danger {
    color: #ff4d4d;
    &:hover {
      background: rgba(255, 77, 77, 0.1);
    }
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  return (
    <>
      <NavContainer>
        <Logo onClick={() => navigate('/dashboard')}>
          LAWYER<span>.AI</span>
        </Logo>

        <NavLinks>
          <StyledLink to="/dashboard" end>Home</StyledLink>
          <StyledLink to="/dashboard/chat">AI Chat</StyledLink>

          {user?.role !== 'civilian' && (
            <StyledLink to="/dashboard/blog">Blog</StyledLink>
          )}

          {user?.role !== 'law_student' && (
            <StyledLink to="/dashboard/courtroom">Courtroom</StyledLink>
          )}

          <StyledLink to="/dashboard/ipc">IPC Finder</StyledLink>
        </NavLinks>

        <UserActions>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{user?.role}</div>
          </div>

          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.2rem',
              marginLeft: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            title="User Menu"
          >
            {/* Handle inconsistent naming: profilePicture (Mongo) vs profileImage (Legacy/Local) */}
            {(user?.profilePicture || user?.profileImage) ? (
              <img
                src={
                  (user.profilePicture || user.profileImage).startsWith('http')
                    ? (user.profilePicture || user.profileImage)
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${(user.profilePicture || user.profileImage).startsWith('/') ? '' : '/'}${user.profilePicture || user.profileImage}`
                }
                alt="User"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />
            )}
          </div>
        </UserActions>

        {/* Dropdown Menu */}
        <Dropdown $isOpen={isDropdownOpen} onMouseLeave={() => setIsDropdownOpen(false)}>
          <DropdownItem onClick={() => {
            navigate('/dashboard/profile');
            setIsDropdownOpen(false);
          }}>
            <FaUser /> My Profile
          </DropdownItem>
          <DropdownItem className="danger" onClick={handleLogout}>
            <FaRightFromBracket /> Sign Out
          </DropdownItem>
        </Dropdown>

        <MobileMenuBtn onClick={() => setIsMobileOpen(true)}>
          <FaBars />
        </MobileMenuBtn>
      </NavContainer>

      {/* Mobile Menu Overlay */}
      <Overlay $isOpen={isMobileOpen} onClick={() => setIsMobileOpen(false)} />

      {/* Mobile Menu Panel */}
      <MobileMenu $isOpen={isMobileOpen}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo>LAWYER<span>.AI</span></Logo>
          <MobileMenuBtn onClick={() => setIsMobileOpen(false)}>
            <FaXmark />
          </MobileMenuBtn>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StyledLink to="/dashboard" end onClick={() => setIsMobileOpen(false)}>Home</StyledLink>
          <StyledLink to="/dashboard/chat" onClick={() => setIsMobileOpen(false)}>AI Chat</StyledLink>

          {user?.role !== 'civilian' && (
            <StyledLink to="/dashboard/blog" onClick={() => setIsMobileOpen(false)}>
              Blog
            </StyledLink>
          )}

          {user?.role !== 'law_student' && (
            <StyledLink to="/dashboard/courtroom" onClick={() => setIsMobileOpen(false)}>
              Courtroom
            </StyledLink>
          )}

          <StyledLink to="/dashboard/ipc" onClick={() => setIsMobileOpen(false)}>
            IPC Finder
          </StyledLink>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <StyledLink to="/dashboard/profile" onClick={() => setIsMobileOpen(false)} style={{ justifyContent: 'center', width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUser /> My Profile
          </StyledLink>
          <LogoutButton onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            <FaRightFromBracket /> Sign Out
          </LogoutButton>
        </div>
      </MobileMenu>
    </>
  );
};

export default Navbar;
