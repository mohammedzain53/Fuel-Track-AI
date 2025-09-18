// frontend/src/components/HelpSupport.js
import React, { useState } from 'react';

export default function HelpSupport() {
  const [activeSection, setActiveSection] = useState('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: "How do I add a fuel entry?",
      answer: "Go to the 'Add Fuel Entry' tab, fill in the details like liters, price per liter, station name, and odometer reading, then click 'Save fuel entry'."
    },
    {
      question: "How does the AI assistant work?",
      answer: "The AI assistant can help you find nearby gas stations, check your fuel expenses, and answer questions about your fuel tracking. Just ask in natural language!"
    },
    {
      question: "Can I find gas stations near me?",
      answer: "Yes! Use the 'Find Stations Near Me' feature in the Add Fuel Entry tab, or ask the AI assistant to 'find gas stations near me'."
    },
    {
      question: "How do I export my data?",
      answer: "Go to your Profile page and click 'Export All Data' to download your fuel tracking data as a JSON file."
    },
    {
      question: "What keyboard shortcuts are available?",
      answer: "Alt+D (Dashboard), Alt+A (Add Fuel), Alt+H (History), Alt+B (AI Assistant). These shortcuts work from anywhere in the app."
    },
    {
      question: "How do I change my password?",
      answer: "Go to your Profile page and click 'Change Password'. You'll need to enter your current password and a new password."
    },
    {
      question: "Can I track multiple vehicles?",
      answer: "Currently, the app tracks all fuel entries together. Multi-vehicle support is planned for a future update."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! Your data is encrypted and stored securely. We use industry-standard security practices to protect your information."
    }
  ];

  const features = [
    {
      icon: "⛽",
      title: "Fuel Tracking",
      description: "Track your fuel purchases with detailed information including price, quantity, and station details."
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Get help finding nearby gas stations and insights about your fuel expenses using natural language."
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "View detailed statistics, monthly breakdowns, and trends in your fuel consumption and spending."
    },
    {
      icon: "🗺️",
      title: "Station Finder",
      description: "Find nearby gas stations with real addresses and direct links to Google Maps for directions."
    },
    {
      icon: "📱",
      title: "Responsive Design",
      description: "Works perfectly on desktop, tablet, and mobile devices with a modern, intuitive interface."
    },
    {
      icon: "⌨️",
      title: "Keyboard Shortcuts",
      description: "Navigate quickly using keyboard shortcuts for power users who want maximum efficiency."
    }
  ];

  return (
    <div className="help-support-container">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📚 Help Topics</h5>
            </div>
            <div className="list-group list-group-flush">
              <button 
                className={`list-group-item list-group-item-action ${activeSection === 'faq' ? 'active' : ''}`}
                onClick={() => setActiveSection('faq')}
              >
                ❓ FAQ
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeSection === 'features' ? 'active' : ''}`}
                onClick={() => setActiveSection('features')}
              >
                ⭐ Features
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeSection === 'shortcuts' ? 'active' : ''}`}
                onClick={() => setActiveSection('shortcuts')}
              >
                ⌨️ Shortcuts
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveSection('contact')}
              >
                📞 Contact
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {activeSection === 'faq' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">❓ Frequently Asked Questions</h5>
              </div>
              <div className="card-body">
                <div className="accordion" id="faqAccordion">
                  {faqs.map((faq, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#faq${index}`}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div 
                        id={`faq${index}`} 
                        className="accordion-collapse collapse" 
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">⭐ App Features</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {features.map((feature, index) => (
                    <div className="col-md-6 mb-4" key={index}>
                      <div className="feature-card h-100">
                        <div className="feature-icon">{feature.icon}</div>
                        <h6>{feature.title}</h6>
                        <p className="text-muted">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shortcuts' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">⌨️ Keyboard Shortcuts</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Navigation Shortcuts</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><kbd>Alt + D</kbd></td>
                          <td>Dashboard</td>
                        </tr>
                        <tr>
                          <td><kbd>Alt + A</kbd></td>
                          <td>Add Fuel Entry</td>
                        </tr>
                        <tr>
                          <td><kbd>Alt + H</kbd></td>
                          <td>Fuel History</td>
                        </tr>
                        <tr>
                          <td><kbd>Alt + B</kbd></td>
                          <td>AI Assistant</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Tips</h6>
                    <ul className="list-unstyled">
                      <li>💡 Shortcuts work from any page</li>
                      <li>💡 Hold Alt key and press the letter</li>
                      <li>💡 Works on both Windows and Mac</li>
                      <li>💡 Great for power users!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">📞 Contact Support</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <form onSubmit={handleContactSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Subject</label>
                        <select
                          className="form-select"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          required
                        >
                          <option value="">Select a topic</option>
                          <option value="bug">🐛 Bug Report</option>
                          <option value="feature">💡 Feature Request</option>
                          <option value="help">❓ Need Help</option>
                          <option value="account">👤 Account Issue</option>
                          <option value="other">📝 Other</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea
                          className="form-control"
                          rows="5"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        📧 Send Message
                      </button>
                    </form>
                  </div>
                  <div className="col-md-4">
                    <h6>Other Ways to Reach Us</h6>
                    <div className="contact-info">
                      <div className="contact-item">
                        <strong>📧 Email:</strong><br/>
                        support@fueltrack.ai
                      </div>
                      <div className="contact-item">
                        <strong>💬 Live Chat:</strong><br/>
                        Available 9 AM - 6 PM IST
                      </div>
                      <div className="contact-item">
                        <strong>📱 Social Media:</strong><br/>
                        @FuelTrackAI
                      </div>
                      <div className="contact-item">
                        <strong>⏱️ Response Time:</strong><br/>
                        Usually within 24 hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}