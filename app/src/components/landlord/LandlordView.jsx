/**
 * LandlordView.jsx — Landlord / Property Manager Portal
 *
 * A form for landlords to submit a new listing.
 * On submit the listing is stored in db.pendingListings
 * and a success toast is shown.
 *
 * Props:
 *   onToast — fn(message) show a toast notification
 */
import React, { useState } from 'react';
import { addPendingListing } from '../../store/db';

export default function LandlordView({ onToast }) {
  /** Form state — all fields for a new listing */
  const [form, setForm] = useState({
    title: '', type: 'Bedsitter', price: '',
    location: '', campus: 'strathmore',
    description: '', phone: '', amenities: '',
  });

  /** Update a single field */
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  /** Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    addPendingListing({
      ...form,
      price: Number(form.price),
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      verified: false,
    });
    onToast('Listing submitted for review! We\'ll notify you within 24 hrs.');
    // Reset form
    setForm({ title: '', type: 'Bedsitter', price: '', location: '', campus: 'strathmore', description: '', phone: '', amenities: '' });
  };

  return (
    <div className="view-container fade-in" id="view-landlord">
      <div className="form-card">
        <h2>🏢 Landlord Portal</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Submit a new student property listing. Our team will verify and publish it within 24 hours.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* Property title */}
            <div className="form-group">
              <label htmlFor="ll-title">Property Name</label>
              <input id="ll-title" type="text" placeholder="e.g. Sunrise Student Suites" value={form.title} onChange={set('title')} required />
            </div>

            {/* Room type */}
            <div className="form-group">
              <label htmlFor="ll-type">Room Type</label>
              <select id="ll-type" value={form.type} onChange={set('type')}>
                <option>Bedsitter</option>
                <option>Hostel Room</option>
                <option>Shared Apartment</option>
                <option>Studio</option>
                <option>1 Bedroom</option>
              </select>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="ll-price">Monthly Rent (KES)</label>
              <input id="ll-price" type="number" placeholder="e.g. 12000" min={1000} value={form.price} onChange={set('price')} required />
            </div>

            {/* Campus */}
            <div className="form-group">
              <label htmlFor="ll-campus">Nearest Campus</label>
              <select id="ll-campus" value={form.campus} onChange={set('campus')}>
                <option value="strathmore">Strathmore University</option>
                <option value="uon">University of Nairobi</option>
                <option value="ku">Kenyatta University</option>
                <option value="jkuat">JKUAT</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="ll-location">Location / Estate</label>
              <input id="ll-location" type="text" placeholder="e.g. Kilimani, Nairobi" value={form.location} onChange={set('location')} required />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="ll-phone">Contact Phone</label>
              <input id="ll-phone" type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set('phone')} required />
            </div>

            {/* Amenities */}
            <div className="form-group full-width">
              <label htmlFor="ll-amenities">Amenities (comma-separated)</label>
              <input id="ll-amenities" type="text" placeholder="Wi-Fi, CCTV, Borehole, Parking" value={form.amenities} onChange={set('amenities')} />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label htmlFor="ll-description">Property Description</label>
              <textarea id="ll-description" rows={4} placeholder="Describe the property, rules, and unique features…" value={form.description} onChange={set('description')} required />
            </div>
          </div>

          <button type="submit" className="btn btn--full">
            Submit for Review
          </button>
        </form>
      </div>
    </div>
  );
}
