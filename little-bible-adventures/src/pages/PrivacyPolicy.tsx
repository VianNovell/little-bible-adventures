import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>
        <div className="privacy-title-group">
          <Shield size={32} className="privacy-icon" />
          <h1>Privacy Policy</h1>
        </div>
      </div>

      <div className="privacy-content card">
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Little Bible Adventures! We are committed to protecting the privacy of our users, 
            especially children. This Privacy Policy explains how we collect, use, and safeguard your 
            information when you use our platform.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information to provide a safe and personalized experience:</p>
          <ul>
            <li><strong>Account Information:</strong> Parents and Teachers provide their email address and name during sign-up.</li>
            <li><strong>Child Profiles:</strong> Parents can create profiles for their children (first name, age group, and avatar choice). We do not require children to provide any personal contact information.</li>
            <li><strong>App Activity:</strong> We track reading progress, badges earned, and participation in activities to personalize the learning experience.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Children's Privacy (COPPA Compliance)</h2>
          <p>
            Protecting children's privacy is our highest priority. We do not knowingly collect personal 
            contact information directly from children under 13 without verifiable parental consent. All 
            child profiles are managed through a parent or teacher's account. If we discover that we have 
            collected personal information from a child without parental consent, we will delete that information immediately.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. How We Use Your Information</h2>
          <p>Your information is used strictly for platform operations:</p>
          <ul>
            <li>To track reading milestones and award achievements.</li>
            <li>To allow parents to monitor their child's progress.</li>
            <li>To enable teachers to host secure, invited-only live sessions.</li>
            <li>To improve and optimize the Little Bible Adventures platform.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Sharing of Information</h2>
          <p>
            <strong>We do not sell your personal information.</strong> We only share data with trusted 
            third-party service providers (like our secure database host) strictly for the purpose of operating 
            the platform. Prayer requests or blog posts shared within age groups are visible only to verified 
            members of those specific groups.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Data Security</h2>
          <p>
            We implement robust, industry-standard security measures to protect your data. All user data is 
            encrypted and stored securely in our database. Accounts are protected by password authentication 
            and Row Level Security (RLS) to ensure users can only access their own data.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how we handle your data, 
            please contact us through your Teacher or Parent portal.
          </p>
        </section>
      </div>
    </div>
  );
}
