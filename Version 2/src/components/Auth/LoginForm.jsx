import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-main);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const EyeIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--text-main);
  }
`;

const SubmitButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 1rem;

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const HelperText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;

  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4d;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid rgba(255, 0, 0, 0.2);
`;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <InputGroup>
        <InputIcon><FaEnvelope /></InputIcon>
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </InputGroup>

      <InputGroup>
        <InputIcon><FaLock /></InputIcon>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <EyeIcon onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </EyeIcon>
      </InputGroup>

      <div style={{ textAlign: 'right' }}>
        <HelperText style={{ display: 'inline' }}>Forgot Password?</HelperText>
      </div>

      <SubmitButton type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </SubmitButton>
    </Form>
  );
};

export default LoginForm;
