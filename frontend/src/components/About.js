// frontend/src/components/About.js
import React from 'react';

export default function About() {
  const teamMembers = [
    {
      name: "AI Assistant",
      role: "Lead Developer",
      avatar: "🤖",
      description: "Built with love for fuel tracking enthusiasts"
    }
  ];

  const technologies = [
    { name: "React", icon: "⚛️", description: "Frontend framework" },
    { name: "Node.js", icon: "🟢", description: "Backend runtime" },
    { name: "MongoDB", icon: "🍃", description: "Database" },
    { name: "Express", icon: "🚀", description: "Web framework" },
    { name: "Bootstrap", icon: "🎨", description: "UI framework" },
    { name: "OpenStreetMap", icon: "🗺️", description: "Maps & locations" }
  ];

  const features = [
    "⛽ Comprehensive fuel expense tracking",
    "🤖 AI-powered assistant for insights",
    "🗺️ Real-time gas station finder",
    "📊 Detailed analytics and statistics",
    "📱 Responsive design for all devices",
    "⌨️ Keyboard shortcuts for power users",
    "🔒 Secure data encryption",
    "📤 Data export capabilities"
  ];

  return (
    <div className="about-container">
      <div className="row">
        <div className="col-12">
          <div className="hero-section text-center mb-5">
            <div className="hero-icon">⛽</div>
            <h1 className="hero-title">Fuel Track AI</h1>
            <p className="hero-subtitle">Smart fuel expense tracking with AI assistance</p>
            <div className="version-badge">
              <span className="badge bg-primary">Version 1.0.0</span>
              <span className="badge bg-success ms-2">Stable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">🎯 Our Mission</h5>
            </div>
            <div className="card-body">
              <p>
                Fuel Track AI was created to simplify fuel expense tracking for individuals and families. 
                We believe that managing your fuel costs shouldn't be complicated or time-consuming.
              </p>
              <p>
                Our AI-powered assistant helps you find the best gas stations, track your spending patterns, 
                and make informed decisions about your fuel consumption.
              </p>
              <p>
                Whether you're a daily commuter, a business owner managing fleet expenses, or someone who 
                just wants to keep track of their fuel costs, Fuel Track AI is designed to make your life easier.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">✨ Key Features</h5>
            </div>
            <div className="card-body">
              <div className="features-list">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🛠️ Built With</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {technologies.map((tech, index) => (
                  <div key={index} className="col-md-4 col-sm-6 mb-3">
                    <div className="tech-card">
                      <div className="tech-icon">{tech.icon}</div>
                      <div className="tech-name">{tech.name}</div>
                      <div className="tech-description">{tech.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📊 Statistics</h5>
            </div>
            <div className="card-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">1.0.0</div>
                  <div className="stat-label">Current Version</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">2025</div>
                  <div className="stat-label">Release Year</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Free to Use</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">AI Assistant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🔒 Privacy & Security</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">🔐 <strong>Encrypted Data:</strong> All your data is encrypted and secure</li>
                <li className="mb-2">🚫 <strong>No Tracking:</strong> We don't track your personal activities</li>
                <li className="mb-2">📱 <strong>Local Storage:</strong> Your data stays on your device when possible</li>
                <li className="mb-2">🔒 <strong>Secure Authentication:</strong> JWT-based secure login system</li>
                <li className="mb-2">📤 <strong>Data Export:</strong> You own your data and can export it anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🚀 Future Plans</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Coming Soon</h6>
                  <ul>
                    <li>🚗 Multi-vehicle support</li>
                    <li>📈 Advanced analytics and reports</li>
                    <li>🔔 Smart notifications and reminders</li>
                    <li>📱 Mobile app for iOS and Android</li>
                    <li>🌙 Dark mode theme</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Under Consideration</h6>
                  <ul>
                    <li>👥 Family/team sharing features</li>
                    <li>💳 Receipt scanning with OCR</li>
                    <li>🏆 Gamification and achievements</li>
                    <li>🔗 Integration with banking apps</li>
                    <li>🌍 Multi-language support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📞 Get in Touch</h5>
            </div>
            <div className="card-body text-center">
              <p>Have questions, suggestions, or feedback? We'd love to hear from you!</p>
              <div className="contact-buttons">
                <button className="btn btn-primary me-2">📧 Email Support</button>
                <button className="btn btn-outline-primary me-2">💬 Live Chat</button>
                <button className="btn btn-outline-secondary">🐛 Report Bug</button>
              </div>
              <div className="mt-4">
                <small className="text-muted">
                  Made with ❤️ for fuel tracking enthusiasts everywhere
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}