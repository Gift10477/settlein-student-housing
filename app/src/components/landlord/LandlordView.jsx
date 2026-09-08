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
import React, { useState, useEffect } from 'react';
import { addProperty, getProperties, updateProperty } from '../../services/api';
import { addPendingListing } from '../../store/db';

export default function LandlordView({ onToast }) {
  /** Mode: 'submit' (INSERT) or 'manage' (SELECT & UPDATE) */
  const [tab, setTab] = useState('submit');

  /** Form state — all fields for a new listing */
  const [form, setForm] = useState({
    title: '', type: 'Bedsitter', price: '',
    location: '', campus: 'strathmore',
    description: '', phone: '', amenities: '',
  });

  /** Manage properties state */
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Load properties from database */
  const fetchList = () => {
    setLoading(true);
    getProperties()
      .then((data) => {
        setProperties(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tab === 'manage') {
      fetchList();
    }
  }, [tab]);

  /** Update a single field */
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  /** Handle form submission (INSERT) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      amenities: form.amenities,
    };

    try {
      // 1. Persist to MySQL via Express
      await addProperty(payload);
      // 2. Also keep local fallback in sync
      addPendingListing({
        ...form,
        price: Number(form.price),
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        verified: false,
      });

      onToast('Listing inserted into MySQL database successfully!');
      // Reset form
      setForm({ title: '', type: 'Bedsitter', price: '', location: '', campus: 'strathmore', description: '', phone: '', amenities: '' });
    } catch (err) {
      console.error(err);
      onToast('Could not connect to backend, saved locally.');
      addPendingListing({
        ...form,
        price: Number(form.price),
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        verified: false,
      });
    }
  };

  /** Handle property update (UPDATE) */
  const handleUpdatePrice = async (prop) => {
    const newPrice = prompt(`Enter new rent price for "${prop.title}" (KES):`, prop.price);
    if (!newPrice || isNaN(newPrice)) return;

    try {
      await updateProperty(prop.id, { price: Number(newPrice) });
      onToast(`Updated rent price for "${prop.title}" in MySQL database.`);
      fetchList();
    } catch (err) {
      onToast(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="view-container fade-in" id="view-landlord">
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Landlord Portal</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${tab === 'submit' ? 'btn--primary' : 'btn--gray'}`}
              onClick={() => setTab('submit')}
              type="button"
            >
              Add Listing (INSERT)
            </button>
            <button
              className={`btn ${tab === 'manage' ? 'btn--primary' : 'btn--gray'}`}
              onClick={() => setTab('manage')}
              type="button"
            >
              Manage Properties (UPDATE)
            </button>
          </div>
        </div>

        {tab === 'submit' ? (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Submit a new student property listing. This will run an <strong>INSERT</strong> statement into your MySQL database.
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
                Submit Listing (INSERT into MySQL)
              </button>
            </form>
          </>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              All properties currently stored in MySQL. Click <strong>Edit Rent (UPDATE)</strong> to update any listing.
            </p>

            {loading ? (
              <p>Loading database records...</p>
            ) : properties.length === 0 ? (
              <p>No listings found in the database.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {properties.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--bg-secondary, #f8fafc)',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{p.title}</h4>
                      <p style={{ margin: '0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {p.location} • {p.type} • <strong>KES {Number(p.price).toLocaleString()} / mo</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => handleUpdatePrice(p)}
                      style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                      Edit Rent (UPDATE)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
