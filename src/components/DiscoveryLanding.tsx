import React from 'react';
import { ArrowRight, Sparkles, Zap, Calendar, Bell } from 'lucide-react';

interface DiscoveryLandingProps {
  onStartScan: () => void;
}

export const DiscoveryLanding: React.FC<DiscoveryLandingProps> = ({ onStartScan }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* AI Event Discovery Badge */}
      <div className="ai-badge">
        <Sparkles size={14} />
        <span>AI Event Discovery</span>
      </div>

      {/* Hero Section */}
      <div className="hero-container">
        <div>
          <h1 className="hero-title">
            Discover Campus Events<br />
            from Club Socials
          </h1>
          <p className="hero-subtitle">
            Give a club's Instagram handle and let our AI agent find and organize their upcoming events for you.
          </p>

          <button 
            className="btn-primary" 
            onClick={onStartScan}
            id="scan-club-handle-cta"
          >
            <span>Scan a Club Handle</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Hero 3D Graphic */}
        <div className="hero-graphic-wrapper">
          <img
            src="/hero-illustration.png"
            alt="Instagram AI Event Discovery illustration"
            className="hero-graphic-image"
          />
        </div>
      </div>

      {/* Feature Indicators Bar */}
      <div className="features-bar" style={{ marginTop: 'auto' }}>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Zap size={18} />
          </div>
          <span>Auto fetch from Instagram</span>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Calendar size={18} />
          </div>
          <span>Extract event details</span>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Bell size={18} />
          </div>
          <span>Keep events updated</span>
        </div>
      </div>
    </div>
  );
};
