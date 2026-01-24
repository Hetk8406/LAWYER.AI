import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaPaperPlane, FaSpinner, FaEnvelope, FaPhone, FaLocationDot } from 'react-icons/fa6';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Box = styled.div`
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 30px;
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  display: flex;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const InfoSide = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6c5dd3 0%, #4a40a2 100%);
  padding: 3rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 3rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;

    svg { 
        background: rgba(255,255,255,0.2);
        padding: 10px;
        border-radius: 10px;
        width: 40px;
        height: 40px;
    }
  }
`;

const FormSide = styled.div`
  flex: 1.5;
  padding: 4rem;
  background: rgba(255,255,255,0.02);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  input, textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 1rem;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(255,255,255,0.08);
    }
  }

  textarea {
    resize: vertical;
    min-height: 150px;
  }
`;

const SubmitBtn = styled.button`
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(108, 93, 211, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px; right: 20px;
  padding: 1rem 2rem;
  border-radius: 12px;
  background: ${props => props.type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
  color: white;
  transform: ${props => props.show ? 'translateX(0)' : 'translateX(150%)'};
  transition: transform 0.4s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const ContactPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ show: false, msg: '', type: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/contact/submit', formData);
      setNotif({ show: true, msg: "Message sent! We'll get back to you.", type: 'success' });
      setFormData({ ...formData, message: '' });
    } catch (err) {
      setNotif({ show: true, msg: "Failed to send message.", type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
    }
  };

  return (
    <Container>
      <Notification show={notif.show} type={notif.type}>{notif.msg}</Notification>

      <Box>
        <InfoSide>
          <div>
            <h2>Let's Talk</h2>
            <p>Have a question about our AI, or want to partner with us? Fill out the form and we'll be in touch.</p>

            <div className="contact-item"><FaEnvelope /> support@lawyer.ai</div>
            <div className="contact-item"><FaPhone /> +91 94095 59039 , +91 99744 39979 </div>
            <div className="contact-item"><FaLocationDot /> Ahmedabad, Gujarat, India</div>
          </div>
        </InfoSide>

        <FormSide>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Your Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!user?.email} required />
            </FormGroup>
            <FormGroup>
              <label>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help?" />
            </FormGroup>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
              {loading ? 'Sending...' : 'Send Message'}
            </SubmitBtn>
          </form>
        </FormSide>
      </Box>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </Container>
  );
};

export default ContactPage;
