import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../static/common.css';
import '../static/AboutUs.css';

const AboutUs = () => {
  const [animatedStats, setAnimatedStats] = useState({
    emergency: 0,
    beds: 0,
    specialties: 0,
    research: 0,
    experts: 0
  });

  // Animate stats counting
  useEffect(() => {
    const finalStats = {
      emergency: 7,
      beds: 500,
      specialties: 30,
      research: 5,
      experts: 125
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(finalStats).forEach(stat => {
      let current = 0;
      const increment = finalStats[stat] / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalStats[stat]) {
          current = finalStats[stat];
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({
          ...prev,
          [stat]: Math.floor(current)
        }));
      }, stepDuration);
    });
  }, []);

  return (
    <div className="hospital-app">
      <Header />
      
      <main className="hospital-main-content">
        {/* Hero Section */}
        <section className="about-hero-section">
          <div className="hero-container">
            <div className="about-us-label">
                <span>ABOUT US</span>
            </div>
            <div className="hero-content">
              <h1 className="hero-title">
                A healthcare institution built on <span className="highlight">ethics, care and compassion</span>
              </h1>
              <p className="hero-description">
                Situated in the heart of Vellore, VS Hospitals is the beating heart of the city's healthcare officials. 
                A destination for world-class healthcare, equipped with the latest in medical technology and the best in 
                class equipment to facilitate quick and accurate diagnosis.
              </p>
            </div>
            <div className="welcome-section">
              <h2 className="welcome-title">Cordially welcomes you</h2>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">X{animatedStats.emergency}</span>
                <span className="stat-label">Emergency Care</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">+{animatedStats.beds}</span>
                <span className="stat-label">Beds</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{animatedStats.specialties}</span>
                <span className="stat-label">Specialties</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{animatedStats.research}</span>
                <span className="stat-label">Research Units</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">+{animatedStats.experts}</span>
                <span className="stat-label">Experts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="vision-mission-section">
          <div className="container">
            <div className="content-grid">
              <div className="vision-section">
                <h2 className="section-title">Our Vision</h2>
                <p className="section-text">
                  To be the uncontested leader in healthcare, academics and research.
                </p>
              </div>
              
              <div className="mission-section">
                <h2 className="section-title">Our Mission</h2>
                <p className="section-text">
                  To realise our vision through honest, ethical and scientific practices for the ultimate benefit of the community.
                </p>
              </div>
            </div>

            <div className="quote-section">
              <blockquote className="vision-quote">
                "Genuinely good intentions cannot but yield noble results."
              </blockquote>
              <p className="quote-author">Sakthivel.M && Vignesh Kumar</p>
              <p className="quote-position">Chairman</p>
            </div>

            <div className="description-section">
              <p>
                VS Hospitals is the result of the best of intentions done in the interest of restoring good health 
                to the people of Vellore and beyond. Equipped with the latest technology, and the best of medical professionals, 
                we stand tall as a monument of solace to the ailing and a place for people to restore and maintain good health.
              </p>
            </div>
          </div>
        </section>

        {/* Validation Section */}
        <section className="validation-section">
          <div className="container">
            <h3 className="validation-title">Validation of our efforts</h3>
            <div className="foundation-text">
              <p>Laying the foundation</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
          
        </section>
        
        {/* Facilities Section */}
        <section className="facilities-section">
          <div className="container">
            <div className="facilities-header">
              <h2 className="facilities-main-title">The VS exclusives</h2>
              <p className="facilities-subtitle">
                Best-in-class technology, top-drawer treatment protocols, the best of doctors, and quality care.
              </p>
            </div>

            <div className="facilities-grid">
              <div className="facility-item">
                <h4 className="facility-name">Robotic Hybrid Operation Theatre</h4>
                <p className="facility-description">Advanced surgical suite with robotic assistance for precision surgeries</p>
              </div>
              
              <div className="facility-item">
                <h4 className="facility-name">ROSA Neurosurgical Robot and Epilepsy Monitoring unit</h4>
                <p className="facility-description">State-of-the-art neurological care with robotic precision</p>
              </div>
              
              <div className="facility-item">
                <h4 className="facility-name">3T MRI with In-Bore experience</h4>
                <p className="facility-description">High-resolution imaging with enhanced patient comfort</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="contact-cta-section">
          <div className="container">
            <div className="cta-content">
              <h3 className="cta-title">Experience World-Class Healthcare</h3>
              <p className="cta-description">
                Located at Chennai - Bengaluru Highway, Vellore. Emergency hotline available 24/7.
              </p>
              {/* <div className="cta-buttons">
                <button className="cta-btn primary">Book Appointment</button>
                <button className="cta-btn secondary">Emergency Contact</button>
              </div> */}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;