import React, { useState } from 'react';
import '../design/LandingPage.css';
import mdlabLogo from '../assets/mdlab-logo.png';

function LandingPage({ onNavigateToLogin, onNavigateToSignUp }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: '🔬',
      title: 'Hematology',
      description: 'Complete blood count and blood cell analysis for accurate diagnosis'
    },
    {
      icon: '🧪',
      title: 'Clinical Chemistry',
      description: 'Blood sugar, lipid profile, kidney and liver function tests'
    },
    {
      icon: '🦠',
      title: 'Clinical Microscopy',
      description: 'Urinalysis, fecalysis, and other microscopic examinations'
    },
    {
      icon: '💉',
      title: 'Serology',
      description: 'Pregnancy tests, blood typing, and infectious disease screening'
    },
    {
      icon: '🩸',
      title: 'Coagulation Studies',
      description: 'Blood clotting tests and hemostasis evaluation'
    },
    {
      icon: '📊',
      title: 'Special Tests',
      description: 'Specialized laboratory examinations and diagnostic procedures'
    }
  ];

  const features = [
    {
      icon: '✓',
      title: 'Accurate Results',
      description: 'State-of-the-art equipment ensuring precise and reliable test results'
    },
    {
      icon: '⚡',
      title: 'Fast Turnaround',
      description: 'Quick processing with same-day results for most routine tests'
    },
    {
      icon: '👨‍⚕️',
      title: 'Professional Staff',
      description: 'Licensed medical technologists and experienced healthcare professionals'
    },
    {
      icon: '💰',
      title: 'Affordable Rates',
      description: 'Competitive pricing without compromising quality and accuracy'
    }
  ];

  const featuredTests = [
    { name: 'Complete Blood Count (CBC)', price: '₱180', turnaround: 'Same Day' },
    { name: 'Urinalysis', price: '₱100', turnaround: 'Same Day' },
    { name: 'Fecalysis', price: '₱100', turnaround: 'Same Day' },
    { name: 'Blood Sugar (FBS/RBS)', price: '₱120', turnaround: 'Same Day' },
    { name: 'Lipid Profile', price: '₱600', turnaround: 'Same Day' },
    { name: 'Pregnancy Test (Serum)', price: '₱180', turnaround: '2 Hours' }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      text: 'Very professional and fast service! Got my results the same day. Highly recommended!',
      role: 'Patient'
    },
    {
      name: 'Juan Dela Cruz',
      text: 'The staff were very accommodating and the facility is clean. Best lab in town!',
      role: 'Patient'
    },
    {
      name: 'Ana Rodriguez',
      text: 'Affordable prices and accurate results. I always come here for my laboratory needs.',
      role: 'Patient'
    }
  ];

  const handleBookAppointment = () => {
    onNavigateToSignUp();
  };

  const handleViewTests = () => {
    // Scroll to services section
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = () => {
    onNavigateToLogin();
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src={mdlabLogo} alt="MD Lab Logo" />
            <span>MD LAB DIRECT</span>
          </div>
          
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#services">Services</a>
            <a href="#about">About Us</a>
            <a href="#tests">Tests</a>
            <a href="#contact">Contact</a>
            <button className="nav-btn-login" onClick={handleLogin}>Login</button>
            <button className="nav-btn-signup" onClick={onNavigateToSignUp}>Sign Up</button>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Reliable Medical Laboratory Services</h1>
          <p className="hero-subtitle">
            Experience accurate, efficient, and fast laboratory results you can trust. 
            Your health is our priority.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleBookAppointment}>
              Book Appointment
            </button>
            <button className="btn-secondary" onClick={handleViewTests}>
              View Tests Available
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive laboratory services for all your medical testing needs</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="about-grid">
            <div className="about-content">
              <h2>About MD Lab Direct</h2>
              <p>
                MD Lab Direct is a trusted medical laboratory committed to providing 
                accurate and timely diagnostic services. With state-of-the-art equipment 
                and a team of experienced medical technologists, we ensure the highest 
                quality standards in all our laboratory procedures.
              </p>
              <p>
                Our mission is to deliver reliable laboratory results that healthcare 
                providers and patients can depend on for accurate diagnosis and treatment 
                decisions. We pride ourselves on our commitment to excellence, affordability, 
                and exceptional customer service.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <h3>10+</h3>
                  <p>Years of Service</p>
                </div>
                <div className="stat-item">
                  <h3>50+</h3>
                  <p>Test Types</p>
                </div>
                <div className="stat-item">
                  <h3>10,000+</h3>
                  <p>Satisfied Patients</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <span>🔬</span>
                <p>Professional Laboratory Services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Choose MD Lab?</h2>
            <p>We're committed to excellence in every aspect of our service</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tests Section */}
      <section id="tests" className="tests-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Featured Laboratory Tests</h2>
            <p>Our most commonly requested tests with competitive pricing</p>
          </div>
          
          <div className="tests-grid">
            {featuredTests.map((test, index) => (
              <div key={index} className="test-card">
                <div className="test-header">
                  <h3>{test.name}</h3>
                  <span className="test-price">{test.price}</span>
                </div>
                <div className="test-info">
                  <span className="test-turnaround">⏱️ {test.turnaround}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="tests-cta">
            <p>Looking for other tests?</p>
            <button className="btn-outline" onClick={handleBookAppointment}>
              View All Tests
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>What Our Patients Say</h2>
            <p>Read about the experiences of our valued patients</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.name.charAt(0)}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Book your laboratory appointment today and experience quality healthcare</p>
            <button className="btn-cta" onClick={handleBookAppointment}>
              Book Your Appointment Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-about">
              <img src={mdlabLogo} alt="MD Lab Logo" className="footer-logo" />
              <h3>MD LAB DIRECT</h3>
              <p>Your trusted partner in medical laboratory services</p>
            </div>
            
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#services">Our Services</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#tests">Laboratory Tests</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            
            <div className="footer-hours">
              <h4>Operating Hours</h4>
              <ul>
                <li>Monday - Friday: 7:00 AM - 5:00 PM</li>
                <li>Saturday: 7:00 AM - 3:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
            
            <div className="footer-contact">
              <h4>Contact Information</h4>
              <ul>
                <li>📍 MDLAB Direct - Main Branch</li>
                <li>📞 (123) 456-7890</li>
                <li>✉️ info@mdlabdirect.com</li>
                <li>🌐 www.mdlabdirect.com</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 MD Lab Direct. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span>•</span>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
