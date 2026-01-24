import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaRobot, FaGavel, FaPenNib, FaBook, FaScaleUnbalanced, FaUsers, FaShieldHalved, FaLaptop, FaFileSignature, FaBrain, FaFileContract, FaChartLine } from 'react-icons/fa6';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  color: var(--text-main);
  animation: ${fadeIn} 0.8s ease-out;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 5rem;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff 0%, #a0e6ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(160, 230, 255, 0.3);
  }

  p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(108, 93, 211, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: var(--primary);
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      background: var(--primary);
      color: white;
      box-shadow: 0 0 20px rgba(108, 93, 211, 0.5);
    }
  }

  .icon-wrapper {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: var(--primary);
    margin-bottom: 1.5rem;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    position: relative;
  }
`;

const featuresData = [
  {
    icon: <FaRobot />,
    title: "AI-Powered Analysis",
    description: "Get instant legal advice with AI-driven insights. Lawyer.AI helps with research, case analysis, and document drafting."
  },
  {
    icon: <FaGavel />,
    title: "Virtual Courtroom",
    description: "A secure, seamless, and professional virtual meeting space for lawyers and civilians to connect and discuss cases."
  },
  {
    icon: <FaPenNib />,
    title: "Legal Blog Hub",
    description: "A knowledge platform where experienced lawyers share insights, case studies, and legal updates."
  },
  {
    icon: <FaBook />,
    title: "IPC Dictionary",
    description: "A comprehensive and user-friendly legal dictionary covering all IPC sections for easy reference."
  },
  {
    icon: <FaScaleUnbalanced />,
    title: "Case Prediction",
    description: "Leverage historical case data and AI analytics to predict the potential outcome of legal disputes."
  },
  {
    icon: <FaLaptop />,
    title: "Multi-Device Access",
    description: "Access Lawyer.AI on desktops, tablets, and mobile devices, ensuring a smooth legal experience anywhere."
  },
  {
    icon: <FaBrain />,
    title: "NLU Technology",
    description: "Our advanced Natural Language Understanding (NLU) allows for human-like legal conversations."
  },
  {
    icon: <FaShieldHalved />,
    title: "Secure & Private",
    description: "All legal interactions are end-to-end encrypted, ensuring complete privacy and confidentiality."
  },
  {
    icon: <FaFileContract />,
    title: "Contract Analysis",
    description: "Upload contracts for AI review to identify risks, clauses, and key terms in seconds."
  }
];

const FeaturesPage = () => {
  return (
    <PageContainer>
      <HeroSection>
        <h1>Powerful Legal Features</h1>
        <p>Everything you need to navigate the legal world, empowered by Artificial Intelligence.</p>
      </HeroSection>

      <Grid>
        {featuresData.map((feature, index) => (
          <FeatureCard key={index}>
            <div className="icon-wrapper">
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </FeatureCard>
        ))}
      </Grid>
    </PageContainer>
  );
};

export default FeaturesPage;
