import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaScaleUnbalanced, FaRobot, FaBook, FaGavel, FaPenNib } from 'react-icons/fa6';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scrollText = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: white;
  animation: ${fadeIn} 0.8s ease-out;
`;

const NewsTicker = styled.div`
  background: rgba(25, 195, 125, 0.1);
  color: var(--primary);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  border: 1px solid rgba(25, 195, 125, 0.2);
  position: relative;

  strong {
    margin-right: 1.5rem;
    z-index: 2;
    background: #15171e; // Match bg-dark roughly to hide text behind
    padding-right: 10px;
  }

  .ticker-track {
    display: inline-block;
    animation: ${scrollText} 45s linear infinite;
    padding-left: 100%; /* Start off-screen */
  }

  &:hover .ticker-track {
    animation-play-state: paused;
  }

  span {
    display: inline-block;
    margin-right: 50px;
  }
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #6c5dd3 0%, #8f85f2 100%);
  padding: 3rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(108, 93, 211, 0.3);

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(50px);
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-main);
  border-left: 4px solid var(--primary);
  padding-left: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const Card = styled(Link)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  min-height: 200px;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--primary);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);

    .icon {
      transform: scale(1.1);
      color: var(--primary);
    }
  }

  .icon {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 16px;
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 20px;
    font-size: 4rem;
    color: var(--primary);
    opacity: 0.3;
    font-family: serif;
  }

  p {
    font-style: italic;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(45deg, #6c5dd3, #8f85f2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    div {
      h5 { margin: 0; color: white; }
      span { font-size: 0.8rem; color: var(--text-secondary); }
    }
  }
`;

const CarouselContainer = styled.div`
  overflow: hidden;
  position: relative;
  max-width: 800px;
  margin: 0 auto 3rem;
  
  .indicators {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background: var(--primary);
        transform: scale(1.2);
      }
    }
  }
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
`;

const TestimonialSlide = styled.div`
  min-width: 100%;
  padding: 0 1rem;
`;

const DashboardHome = () => {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  const newsItems = [
    "New IPC Amendment (2024) Passed - Key changes in Section 377",
    "Supreme Court Guidelines on Digital Privacy & Data Protection",
    "Bar Council of India announces new registration norms for 2025",
    "AI Regulation Bill proposed in upcoming parliament session",
    "Landmark judgment on Property Rights for Daughters summarized"
  ];

  const testimonials = [
    {
      text: "Lawyer.AI has completely transformed how I research cases. The IPC dictionary is a lifesaver!",
      name: "Adv. Rajesh Kumar",
      role: "Criminal Lawyer"
    },
    {
      text: "The AI assistant is accurate and surprisingly nuanced. It saves me hours of drafting time.",
      name: "Sriya Patel",
      role: "Law Student"
    },
    {
      text: "Finally, a platform that connects civilians with lawyers seamlessly. The courtroom feature is brilliant.",
      name: "Amit Verma",
      role: "Civilian User"
    }
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Auto-slide effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Container>
      {/* News Ticker */}
      <NewsTicker>
        <strong>⚡ LEGAL TRENDING:</strong>
        <div className="ticker-track">
          {newsItems.map((item, i) => (
            <span key={i}>• {item}</span>
          ))}
        </div>
      </NewsTicker>

      {/* Welcome Banner */}
      <WelcomeBanner>
        <h1>Hello, {userName}! 👋</h1>
        <p>Ready to revolutionize your legal workflow? Your AI assistant is standing by.</p>
      </WelcomeBanner>


      {/* Quick Actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <Grid>
        <Card to="/dashboard/chat">
          <div className="icon"><FaRobot /></div>
          <h3>AI Assistant</h3>
          <p>Get instant answers to legal queries</p>
        </Card>

        {/* Renamed "Start Analyzing" to "Blog Space" for clarity & separate link */}
        {user?.role !== 'civilian' && (
          <Card to="/dashboard/blog">
            <div className="icon"><FaPenNib /></div>
            <h3>Legal Articles</h3>
            <p>Read or write insightful legal blogs</p>
          </Card>
        )}

        <Card to="/dashboard/ipc">
          <div className="icon"><FaBook /></div>
          <h3>IPC Dictionary</h3>
          <p>Search simplified Indian Penal Code</p>
        </Card>

        {/* Conditionally hide Courtroom for Law Students */}
        {user?.role !== 'law_student' && (
          <Card to="/dashboard/courtroom">
            <div className="icon"><FaGavel /></div>
            <div className="content">
              <h3>Courtroom</h3>
              <p>Virtual client-lawyer consultation</p>
            </div>
          </Card>
        )}
      </Grid>

      {/* Testimonials Section */}
      <SectionTitle>User Testimonials</SectionTitle>
      <CarouselContainer>
        <CarouselTrack style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {testimonials.map((t, i) => (
            <TestimonialSlide key={i}>
              <TestimonialCard>
                <p>{t.text}</p>
                <div className="author">
                  <div className="avatar">{t.name[0]}</div>
                  <div>
                    <h5>{t.name}</h5>
                    <span>{t.role}</span>
                  </div>
                </div>
              </TestimonialCard>
            </TestimonialSlide>
          ))}
        </CarouselTrack>
        <div className="indicators">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      </CarouselContainer>

    </Container>
  );
};

export default DashboardHome;
