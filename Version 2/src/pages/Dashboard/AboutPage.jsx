import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaQuoteLeft } from 'react-icons/fa6';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  color: var(--text-main);
  animation: ${fadeIn} 0.8s ease-out;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 6rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: var(--primary);
    filter: blur(100px);
    opacity: 0.2;
    z-index: -1;
  }
  
  h1 {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, #fff, #a0e6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.8;
  }
`;

const Section = styled.section`
  margin-bottom: 6rem;
  display: flex;
  align-items: center;
  gap: 4rem;
  
  &:nth-child(even) {
    flex-direction: row-reverse;
  }

  @media (max-width: 900px) {
    flex-direction: column !important;
    gap: 2rem;
    text-align: center;
  }
`;

const ImageBox = styled.div`
  flex: 1;
  height: 400px;
  background: linear-gradient(45deg, #1a1d2d, #2a2d3d);
  border-radius: 30px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  
  /* Placeholder pattern */
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: rgba(255,255,255,0.05);
`;

const ContentBox = styled.div`
  flex: 1;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: var(--primary);
  }

  p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }
`;

const QuoteBox = styled.div`
  background: rgba(108, 93, 211, 0.1);
  border-left: 4px solid var(--primary);
  padding: 2rem;
  border-radius: 0 20px 20px 0;
  margin: 4rem 0;
  position: relative;

  svg {
    font-size: 2rem;
    color: var(--primary);
    opacity: 0.5;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.4rem;
    font-style: italic;
    color: white;
    font-weight: 300;
  }
`;

const AboutPage = () => {
  return (
    <PageContainer>
      <HeroSection>
        <h1>Bridging Justice & Technology</h1>
        <p>
          LawAI is pioneering the future of legal assistance, making justice accessible,
          transparent, and efficient for everyone through the power of Artificial Intelligence.
        </p>
      </HeroSection>

      <Section>
        <ImageBox>🚀</ImageBox>
        <ContentBox>
          <h2>Our Mission</h2>
          <p>
            We strive to democratize legal knowledge. By leveraging advanced AI, we break down complex legal barriers,
            allowing ordinary citizens to understand their rights and enabling lawyers to work with unprecedented efficiency.
          </p>
        </ContentBox>
      </Section>

      <QuoteBox>
        <FaQuoteLeft />
        <p>"Justice delayed is justice denied. We use technology to ensure justice is always within reach."</p>
      </QuoteBox>

      <Section>
        <ImageBox>💡</ImageBox>
        <ContentBox>
          <h2>Our Vision</h2>
          <p>
            A world where legal counsel is not a luxury but a fundamental right accessible to all.
            We envision an ecosystem where AI acts as a trusted co-counsel, reducing backlog and eradicating
            errors in the judicial process.
          </p>
        </ContentBox>
      </Section>

    </PageContainer>
  );
};

export default AboutPage;
