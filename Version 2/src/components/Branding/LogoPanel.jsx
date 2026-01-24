import React from 'react';
import styled from 'styled-components';
import { FaGavel } from 'react-icons/fa'; // Example Icon

const PanelWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, #2b2250 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 250px;
  }
`;

const LogoContainer = styled.div`
  z-index: 1;
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
`;

const Title = styled.h1`
  z-index: 1;
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  z-index: 1;
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 400px;
  line-height: 1.6;
  margin-top: 1rem;
`;

const LogoPanel = () => {
  return (
    <PanelWrapper>
      <LogoContainer>
        <FaGavel />
      </LogoContainer>
      <Title>Lawyer.AI</Title>
      <Subtitle>
        Empowering citizens and legal professionals with advanced AI-driven improved legal insights and tools.
      </Subtitle>
    </PanelWrapper>
  );
};

export default LogoPanel;
