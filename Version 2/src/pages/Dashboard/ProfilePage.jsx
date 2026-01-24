import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaLocationDot, FaGlobe, FaBriefcase, FaGraduationCap, FaCamera, FaRightFromBracket, FaTrash, FaXmark } from 'react-icons/fa6';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropUtils';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 3rem;
`;

const ProfileHeader = styled.div`
  background: var(--bg-panel);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-dark);
  border: 4px solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--text-secondary);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EditAvatarBtn = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--accent);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);

  &:hover {
    transform: scale(1.1);
  }
`;

const HeaderInfo = styled.div`
  flex: 1;

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    color: var(--text-main);
  }

  .badges {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .badge {
    background: rgba(108, 93, 211, 0.15);
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: capitalize;
    border: 1px solid rgba(108, 93, 211, 0.3);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
`;

const ActionBtn = styled.button`
  background: ${props => props.$danger ? 'rgba(255, 77, 77, 0.1)' : 'var(--bg-dark)'};
  color: ${props => props.$danger ? '#ff4d4d' : 'var(--text-main)'};
  border: 1px solid ${props => props.$danger ? 'rgba(255, 77, 77, 0.2)' : 'var(--border)'};
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.$danger ? 'rgba(255, 77, 77, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    transform: translateY(-2px);
  }
`;

const FormSection = styled.div`
  background: var(--bg-panel);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  margin-top: 2rem;

  h3 {
    margin: 0 0 2rem 0;
    color: var(--primary);
    font-size: 1.4rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const ToggleEditBtn = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-hover);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input, select {
    background: var(--bg-dark);
    border: 1px solid var(--border);
    padding: 1rem;
    border-radius: 10px;
    color: var(--text-main);
    font-size: 1rem;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      border-color: transparent;
    }

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(108, 93, 211, 0.2);
    }
  }
`;

const CropperContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    z-index: 3000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const CropperWrapper = styled.div`
    position: relative;
    width: 90%;
    max-width: 500px;
    height: 400px;
    background: #333;
    border-radius: 12px;
    overflow: hidden;
`;

const CropperControls = styled.div`
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
`;

const StyledFormSection = styled(FormSection)`
    padding: 1.5rem;
    overflow: hidden; /* Prevent double scrollbars */
`;

const ControlBtn = styled.button`
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    background: ${props => props.$primary ? 'var(--primary)' : 'var(--bg-panel)'};
    color: ${props => props.$primary ? 'white' : 'var(--text-main)'};
    border: 1px solid ${props => props.$primary ? 'transparent' : 'var(--border)'};

    &:hover {
        opacity: 0.9;
    }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.$type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 1rem;
  transform: ${props => props.$show ? 'translateX(0)' : 'translateX(200%)'};
  transition: transform 0.4s ease-in-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);

  font-weight: 500;
`;

const ProfilePage = () => {
  const { user, updateProfile, updateUserState, logout, loading } = useAuth();
  const navigate = useNavigate();
  // Add useLocation to check for onboarding state
  const { state } = useLocation();

  const [isEditing, setIsEditing] = useState(false);

  // Initial state based on legacy profile fields
  const [formData, setFormData] = useState({
    profileImage: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    nation: '',
    gender: 'male',
    language: 'english',
    profession: '',
    experience: '',
    specialization: '',
    barCouncilId: '',
    universityName: '',
    yearOfStudy: '',
    studentId: '',
    dob: ''
  });

  useEffect(() => {
    // If onboarding, auto-enable editing
    if (state?.onboarding) {
      setIsEditing(true);
      showNotification("Please complete your profile to continue.", "info");
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        ...user,
        // Explicitly set all fields to ensure no undefined values (Controlled Inputs)
        profilePicture: user.profilePicture || '',
        profileImage: user.profileImage || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '', // Critical: ensures value is '' not undefined
        address: user.address || '',
        nation: user.nation || '',
        gender: user.gender || 'male',
        language: user.language || 'english',
        profession: user.profession || '',
        experience: user.experience || '',
        specialization: user.specialization || '',
        barCouncilId: user.barCouncilId || '',
        universityName: user.universityName || '',
        yearOfStudy: user.yearOfStudy || '',
        studentId: user.studentId || '',
        dob: user.dob ? (typeof user.dob === 'string' ? user.dob : `${user.dob.year}-${user.dob.month}-${user.dob.day}`) : ''
      }));
    }
  }, [user, state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Notification State
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce Phone Number, especially for onboarding
    if (!formData.phone || formData.phone.trim() === '') {
      showNotification("Phone number is required to continue.", "error");
      return;
    }

    try {
      // Use the real updateProfile from context
      const result = await updateProfile(formData);

      if (result.success) {
        showNotification("Profile updated successfully!", "success");
        setIsEditing(false);

        // If coming from onboarding, redirect to dashboard/admin after save
        if (state?.onboarding) {
          setTimeout(() => {
            const targetRole = user?.role || formData.role;
            if (targetRole === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 1000);
        }
      } else {
        showNotification(result.message || "Failed to update profile.", "error");
      }
    } catch (error) {
      console.error("Update failed", error);
      showNotification("An unexpected error occurred.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };



  // --- Image Cropping State ---
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        showNotification("File size too large (Max 5MB)", "error");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImage(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const uploadProcessedImage = async (blob) => {
    const imageFormData = new FormData();
    // Create a generic filename for the blob
    imageFormData.append('profileImage', blob, 'profile.jpg');

    try {
      showNotification("Uploading image...", "success");
      const response = await axios.post('/api/auth/upload-profile-image', imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        const imageUrl = response.data.data.profilePicture;
        setFormData(prev => ({ ...prev, profileImage: imageUrl }));
        const updatedUser = { ...user, profilePicture: imageUrl };
        updateUserState(updatedUser);
        showNotification("Profile image uploaded successfully!", "success");
        setShowCropper(false);
        setCropImage(null);
      }
    } catch (error) {
      console.error("Upload failed", error);
      showNotification(error.response?.data?.message || "Failed to upload image.", "error");
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      await uploadProcessedImage(croppedImageBlob);
    } catch (e) {
      console.error(e);
      showNotification("Could not crop image", "error");
    }
  };

  const handleSkipCrop = async () => {
    // Convert base64 data URL to blob to upload as original
    const res = await fetch(cropImage);
    const blob = await res.blob();
    await uploadProcessedImage(blob);
  };

  // --- Delete Confirmation State ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteProfileImage = async () => {
    // Replaced window.confirm with custom modal trigger
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete('/api/auth/delete-profile-image');

      setFormData(prev => ({ ...prev, profileImage: '', profilePicture: '' })); // clear local

      // clear global
      const updatedUser = { ...user };
      delete updatedUser.profilePicture;
      delete updatedUser.profileImage;
      updateUserState(updatedUser);

      showNotification("Profile picture removed.", "success");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete failed", error);
      showNotification("Failed to delete profile picture.", "error");
      setShowDeleteConfirm(false);
    }
  };


  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div style={{ fontSize: '1.2rem' }}>Loading Profile...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Notification $show={notification.show} $type={notification.type}>
        {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
      </Notification>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <CropperContainer>
          <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', border: 'none', padding: 0 }}>Delete Profile Picture?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Are you sure you want to remove your profile photo? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <ControlBtn onClick={() => setShowDeleteConfirm(false)}>Cancel</ControlBtn>
              <ControlBtn style={{ background: '#ff4d4d', color: 'white', border: 'none' }} onClick={confirmDelete}>Delete</ControlBtn>
            </div>
          </div>
        </CropperContainer>
      )}




      {showCropper && (
        <CropperContainer>
          <div style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Crop Profile Picture</div>
          <CropperWrapper>
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </CropperWrapper>
          <CropperControls>
            <ControlBtn onClick={() => setShowCropper(false)}>Cancel</ControlBtn>
            <ControlBtn onClick={handleSkipCrop}>Ukip (Save Original)</ControlBtn>
            <ControlBtn $primary onClick={handleCropSave}>Crop & Save</ControlBtn>
          </CropperControls>
        </CropperContainer>
      )}

      <ProfileHeader>
        <AvatarWrapper>
          <Avatar>
            {/* Handle inconsistent naming: profilePicture (Mongo) vs profileImage (Legacy/Local) */}
            {(formData.profilePicture || formData.profileImage) ? (
              <img
                src={
                  (formData.profilePicture || formData.profileImage).startsWith('http')
                    ? (formData.profilePicture || formData.profileImage)
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${(formData.profilePicture || formData.profileImage).startsWith('/') ? '' : '/'}${formData.profilePicture || formData.profileImage}`
                }
                alt="Profile"
              />
            ) : (
              (formData.name && formData.name.trim() !== '') ? formData.name.charAt(0).toUpperCase() : <FaUser />
            )}
          </Avatar>

          {/* Delete Button - Only show if image exists */}
          {isEditing && (formData.profilePicture || formData.profileImage) && (
            <div
              onClick={handleDeleteProfileImage}
              title="Remove Profile Picture"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#ff4d4d',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 2
              }}
            >
              <FaXmark size={14} />
            </div>
          )}

          {isEditing && (
            <EditAvatarBtn>
              <FaCamera />
              {/* Connected input to handleFileSelect not direct upload */}
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
            </EditAvatarBtn>
          )}
        </AvatarWrapper>

        <HeaderInfo>
          <h1>{formData.name || 'User Name'}</h1>
          <div style={{ color: 'var(--text-secondary)' }}>{formData.email}</div>

          <div className="badges">
            <span className="badge">{formData.profession || user?.role || 'Member'}</span>
            {formData.specialization && <span className="badge">{formData.specialization}</span>}
          </div>
        </HeaderInfo>

        <Actions>
          {isEditing && (
            <ActionBtn $danger onClick={() => {
              navigate('/dashboard/contact');
              showNotification("Please contact support to delete your account.", "error");
            }}>
              <FaTrash /> Delete Account
            </ActionBtn>
          )}
        </Actions>
      </ProfileHeader>

      <StyledFormSection>
        <h3>
          Personal Information
          <ToggleEditBtn onClick={() => isEditing ? document.getElementById('profile-form').requestSubmit() : setIsEditing(true)}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </ToggleEditBtn>
        </h3>

        <form id="profile-form" onSubmit={handleSubmit}>
          {/* Main profile grid - adjusted gap for better spacing */}
          <Grid style={{ gap: '1.5rem' }}>
            <InputGroup>
              <label><FaUser /> Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
            </InputGroup>

            <InputGroup>
              <label><FaEnvelope /> Email</label>
              <input name="email" value={formData.email} disabled style={{ opacity: 0.6 }} />
            </InputGroup>

            <InputGroup>
              <label><FaPhone /> Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
            </InputGroup>

            <InputGroup>
              <label><FaLocationDot /> Address</label>
              <input name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} />
            </InputGroup>

            <InputGroup>
              <label><FaGlobe /> Nation</label>
              <input name="nation" value={formData.nation} onChange={handleChange} disabled={!isEditing} />
            </InputGroup>

            <InputGroup>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Language</label>
              <select name="language" value={formData.language} onChange={handleChange} disabled={!isEditing}>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="gujarati">Gujarati</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} disabled={!isEditing} />
            </InputGroup>
          </Grid>

          {/* Conditional Fields based on Role/Profession */}
          {(user?.role === 'lawyer' || formData.profession === 'lawyer') && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <h3 style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>Professional Details</h3>
              <Grid style={{ gap: '1.5rem' }}>
                <InputGroup>
                  <label><FaBriefcase /> Experience (Years)</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
                <InputGroup>
                  <label>Specialization</label>
                  <input name="specialization" value={formData.specialization} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
                <InputGroup>
                  <label>Bar Council ID</label>
                  <input name="barCouncilId" value={formData.barCouncilId} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
              </Grid>
            </div>
          )}

          {(user?.role === 'student' || user?.role === 'law_student' || formData.profession === 'law_student') && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <h3 style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>Education Details</h3>
              <Grid style={{ gap: '1.5rem' }}>
                <InputGroup>
                  <label><FaGraduationCap /> University</label>
                  <input name="universityName" value={formData.universityName} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
                <InputGroup>
                  <label>Year of Study</label>
                  <input name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
                <InputGroup>
                  <label>Student ID</label>
                  <input name="studentId" value={formData.studentId} onChange={handleChange} disabled={!isEditing} />
                </InputGroup>
              </Grid>
            </div>
          )}
        </form>
      </StyledFormSection>
    </Container>
  );
};

export default ProfilePage;
