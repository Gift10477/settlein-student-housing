/**
 * ContactView.jsx — Contact Us page
 *
 * Sections:
 *  1. Page hero — title + subtitle
 *  2. Two-column layout:
 *     Left  — contact info cards (location, email, phone, hours)
 *     Right — contact form (name, email, subject, message, send button)
 *  3. Map placeholder / office banner
 *
 * Props:
 *   onToast — fn(message) show feedback toast
 */
import React, { useState } from 'react';

const CONTACT_ITEMS = [
  {
    title: 'Visit Us',
    lines: ['The Hub Karen', 'Karen Road, Nairobi', 'Kenya'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Email Us',
    lines: ['hello@settlein.co.ke', 'support@settlein.co.ke'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    title: 'Call Us',
    lines: ['+254 700 123 456', '+254 711 987 654'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13 19.79 19.79 0 0 1 1.07 4.18 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
      </svg>
    ),
  },
  {
    title: 'Working Hours',
    lines: ['Monday – Friday: 8am – 6pm', 'Saturday: 9am – 2pm', 'Sunday: Closed'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

const SUBJECTS = [
  'General Inquiry',
  'Property Listing Support',
  'Report a Problem',
  'Partnership Opportunity',
  'Press & Media',
  'Other',
];

export default function ContactView({ onToast }) {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      onToast('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      onToast('Message sent! We will get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
      setTimeout(() => setSent(false), 4000);
    }, 1200);
  };

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-hero-badge">Get In Touch</span>
          <h1 className="contact-hero-title">We'd Love to Hear From You</h1>
          <p className="contact-hero-sub">
            Whether you're a student looking for a room, a landlord wanting to list your property,
            or have a question about our platform — we're here to help.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="contact-body-section">
        <div className="contact-body-inner">

          {/* Left: Info cards */}
          <div className="contact-info-col">
            <h2 className="contact-info-heading">Contact Information</h2>
            <p className="contact-info-sub">Find us through any of the channels below.</p>

            <div className="contact-info-cards">
              {CONTACT_ITEMS.map((item) => (
                <div key={item.title} className="contact-info-card">
                  <div className="contact-info-icon">{item.icon}</div>
                  <div>
                    <h3 className="contact-info-title">{item.title}</h3>
                    {item.lines.map((line) => (
                      <p key={line} className="contact-info-line">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social follow row */}
            <div className="contact-social-row">
              <span className="contact-social-label">Follow us:</span>
              {[
                { label: 'Twitter', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: 'Instagram', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                { label: 'LinkedIn', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
              ].map(({ label, href, icon }) => (
                <a key={label} href={href} className="contact-social-icon" aria-label={label}>{icon}</a>
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              {sent ? (
                <div className="contact-success">
                  <div className="contact-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will respond within 24 hours.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <h2 className="contact-form-title">Send Us a Message</h2>
                  <p className="contact-form-sub">We typically respond within one business day.</p>

                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label htmlFor="cf-name">Full Name *</label>
                      <input id="cf-name" name="name" type="text" placeholder="e.g. Jane Doe"
                        value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="cf-email">Email Address *</label>
                      <input id="cf-email" name="email" type="email" placeholder="name@email.com"
                        value={form.email} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="cf-subject">Subject</label>
                    <select id="cf-subject" name="subject" value={form.subject} onChange={handleChange}>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="cf-message">Message *</label>
                    <textarea id="cf-message" name="message" rows={5}
                      placeholder="Tell us how we can help you..."
                      value={form.message} onChange={handleChange} required />
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={submitting} id="btn-contact-submit">
                    {submitting ? (
                      <span className="contact-spinner" />
                    ) : (
                      <>
                        Send Message
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
