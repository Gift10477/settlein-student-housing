import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser } from '../services/api';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form for INSERT
  const [form, setForm] = useState({
    name: '',
    email: '',
    course: '',
    campus: 'strathmore',
    residence_area: '',
    phone: '',
    role: 'student',
  });

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((data) => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // INSERT
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(form);
      alert('User inserted into MySQL database successfully!');
      setForm({
        name: '',
        email: '',
        course: '',
        campus: 'strathmore',
        residence_area: '',
        phone: '',
        role: 'student',
      });
      loadUsers();
    } catch (err) {
      alert('Error inserting user: ' + err.message);
    }
  };

  // UPDATE
  const handleUpdateCourse = async (user) => {
    const newCourse = prompt(`Enter new course/programme for ${user.name}:`, user.course || '');
    if (!newCourse) return;
    try {
      await updateUser(user.id, { course: newCourse });
      alert(`Updated ${user.name}'s course in database.`);
      loadUsers();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
      <h3>Database Users (SELECT, INSERT, UPDATE)</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Live connection to MySQL `users` table</p>

      {/* INSERT FORM */}
      <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="text"
          placeholder="Course / Programme"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="text"
          placeholder="Residence Area"
          value={form.residence_area}
          onChange={(e) => setForm({ ...form, residence_area: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Insert User
        </button>
      </form>

      {/* SELECT LIST */}
      {loading ? (
        <p>Loading users from database...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '8px' }}>ID</th>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Email</th>
              <th style={{ padding: '8px' }}>Course</th>
              <th style={{ padding: '8px' }}>Estate</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}>{u.id}</td>
                <td style={{ padding: '8px', fontWeight: '600' }}>{u.name}</td>
                <td style={{ padding: '8px' }}>{u.email}</td>
                <td style={{ padding: '8px' }}>{u.course}</td>
                <td style={{ padding: '8px' }}>{u.residence_area || '-'}</td>
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleUpdateCourse(u)}
                    style={{ padding: '4px 10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Update Course
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
