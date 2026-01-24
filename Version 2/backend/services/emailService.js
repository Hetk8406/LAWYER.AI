require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const createTransporter = async () => {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      debug: true
    });

    // Verify the connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return transporter;
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
};

// Send verification email
exports.sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      throw new Error('Failed to create mail transporter');
    }

    // Frontend verification URL - using proper URL structure
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

    const mailOptions = {
      from: `"LawAI Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your LawAI Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3c72;">Welcome to LawAI!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with LawAI. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>Best regards,<br>The LawAI Team</p>
        </div>
      `
    };

    console.log('Attempting to send verification email to:', email);
    console.log('Verification URL:', verificationUrl);
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      throw new Error('Failed to create mail transporter');
    }

    const roleSpecificContent = {
      lawyer: 'As a lawyer, you have access to all features including blog posting and answering questions in the courtroom.',
      law_student: 'As a law student, you can access the blog, prompt bar, and participate in discussions.',
      civilian: 'You can now ask questions in the courtroom and use the prompt bar for legal assistance.'
    };

    const mailOptions = {
      from: `"LawAI Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to LawAI - Account Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3c72;">Welcome to LawAI!</h2>
          <p>Hello ${name},</p>
          <p>Your email has been successfully verified. Welcome to the LawAI community!</p>
          <p>${roleSpecificContent[role]}</p>
          <p>Get started by exploring our features:</p>
          <ul>
            <li>Prompt Bar - Get instant legal assistance</li>
            <li>Court Room - Ask legal questions</li>
            <li>Blog - Read legal insights</li>
          </ul>
          <p>Best regards,<br>The LawAI Team</p>
        </div>
      `
    };

    console.log('Attempting to send welcome email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};
