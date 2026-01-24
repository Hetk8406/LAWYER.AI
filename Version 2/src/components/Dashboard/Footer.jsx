import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const FooterContainer = styled.footer`
  width: 100%;
  background: var(--bg-panel);
  border-top: 1px solid var(--border);
  padding: 1.5rem 2rem;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  h3 {
    font-size: 1.2rem;
    color: var(--primary);
    margin: 0;
    font-weight: 700;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin: 0;
  }
`;

const LinksSection = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StyledLink = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  font-weight: 500;

  &:hover {
    color: var(--primary);
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  color: var(--text-secondary);
  font-size: 1.1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--primary);
    transform: translateY(-2px);
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <LeftSection>
        <h3>LAWYER.AI</h3>
        <p>&copy; {new Date().getFullYear()} Lawyer.AI. All rights reserved.</p>
      </LeftSection>

      <LinksSection>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <StyledLink to="/dashboard/features">Features</StyledLink>
          <StyledLink to="/dashboard/about">About Us</StyledLink>
          <StyledLink to="/dashboard/contact">Contact</StyledLink>
        </div>

        <SocialIcons>
          <SocialLink href="https://facebook.com" target="_blank"><FaFacebookF /></SocialLink>
          <SocialLink href="https://twitter.com" target="_blank"><FaTwitter /></SocialLink>
          <SocialLink href="https://linkedin.com" target="_blank"><FaLinkedinIn /></SocialLink>
          <SocialLink href="https://instagram.com" target="_blank"><FaInstagram /></SocialLink>
        </SocialIcons>
      </LinksSection>
    </FooterContainer>
  );
};

export default Footer;
