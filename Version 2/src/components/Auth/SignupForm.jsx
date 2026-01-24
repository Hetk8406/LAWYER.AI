import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


// Reuse styled components logic
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
  pointer-events: none;
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

const Select = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-main);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.1);
  }

  option {
    background: var(--bg-panel);
    color: var(--text-main);
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
`;

const SectionTitle = styled.h3`
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.8rem;
`;

const SignupForm = ({ switchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // phone removed
    role: 'civilian',
    specialization: '',
    barCouncilId: '',
    experience: '',
    universityName: '',
    studentId: '',
    yearOfStudy: '',
    password: '',
    passwordConfirm: ''
  });

  const specializations = [
    'Criminal Law', 'Civil Law', 'Family Law',
    'Corporate Law', 'Property Law', 'Immigration Law', 'General Practice'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await signup(formData); // AuthContext now handles login
    setLoading(false);

    if (result.success) {
      // Redirect to Profile Page for Onboarding
      navigate('/dashboard/profile', { state: { onboarding: true } });
    } else {
      alert(result.message);
      if (result.message && result.message.toLowerCase().includes('already exists')) {
        if (switchToLogin) switchToLogin();
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>

      {/* Common Fields */}
      <SectionTitle>Account Details</SectionTitle>
      <InputGroup>
        <InputIcon><FaUser /></InputIcon>
        <Input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
      </InputGroup>

      <InputGroup>
        <InputIcon><FaEnvelope /></InputIcon>
        <Input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
      </InputGroup>

      {/* Phone Number Removed */}

      {/* Role Selection */}
      <SectionTitle>I am a...</SectionTitle>
      <InputGroup>
        <InputIcon><FaUser /></InputIcon>
        <Select name="role" value={formData.role} onChange={handleChange}>
          <option value="civilian">Civilian</option>
          <option value="lawyer">Lawyer</option>
          <option value="law_student">Law Student</option>
        </Select>
      </InputGroup>

      {/* Conditional Fields: Lawyer */}
      {formData.role === 'lawyer' && (
        <>
          <SectionTitle>Professional Details</SectionTitle>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Select name="specialization" value={formData.specialization} onChange={handleChange}>
              <option value="" disabled>Select Specialization</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </Select>
          </InputGroup>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input type="text" name="barCouncilId" placeholder="Bar Council ID" value={formData.barCouncilId} onChange={handleChange} required />
          </InputGroup>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input type="number" name="experience" placeholder="Years of Experience" min="0" step="0.5" value={formData.experience} onChange={handleChange} required />
          </InputGroup>
        </>
      )}

      {/* Conditional Fields: Law Student */}
      {formData.role === 'law_student' && (
        <>
          <SectionTitle>Student Details</SectionTitle>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input type="text" name="universityName" placeholder="University Name" value={formData.universityName} onChange={handleChange} required />
          </InputGroup>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required />
          </InputGroup>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input type="number" name="yearOfStudy" placeholder="Year of Study (1-5)" min="1" max="5" value={formData.yearOfStudy} onChange={handleChange} required />
          </InputGroup>
        </>
      )}

      {/* Password */}
      <SectionTitle>Security</SectionTitle>
      <InputGroup>
        <InputIcon><FaLock /></InputIcon>
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <EyeIcon onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </EyeIcon>
      </InputGroup>
      <InputGroup>
        <InputIcon><FaLock /></InputIcon>
        <Input
          type="password"
          name="passwordConfirm"
          placeholder="Confirm Password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        />
      </InputGroup>

      <SubmitButton type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</SubmitButton>
    </Form>
  );
};

export default SignupForm;
