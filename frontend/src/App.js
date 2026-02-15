import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.js';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Safe API Helper (centralised fetch with auth) ───────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLoginModal,       setShowLoginModal]       = useState(false);
  const [showRegisterModal,    setShowRegisterModal]    = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo">Rain Days</div>
        </div>
        <div className="nav-links">
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="username">Welcome, {user.username}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-btn admin-btn">Admin</Link>
              )}
              <button onClick={() => setShowAppointmentModal(true)} className="nav-btn primary">
                Book Now
              </button>
              <button onClick={logout} className="nav-btn logout-btn">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="nav-btn">Login</button>
              <button onClick={() => setShowRegisterModal(true)} className="nav-btn primary">Register</button>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Est. New Manila, Quezon City</span>
          <h1>Rain Days<br/><em>Barber Shop</em></h1>
          <p>Classic Cuts &amp; Shaves</p>
          <p className="hero-subtitle">
            Your hair, your choice — we make it come to life. The finest cuts and shaves
            in New Manila, Quezon City.
          </p>
          {user && (
            <button onClick={() => setShowAppointmentModal(true)} className="btn-hero">
              Make Appointment
            </button>
          )}
        </div>
      </section>

      <section id="about" className="about">
        <span className="section-sub">Our Story</span>
        <h2>About Rain Days</h2>
        <div className="section-divider"></div>
        <p>
          Founded in the heart of New Manila, <strong>Rain Days</strong> is more than just a
          barbershop — it's an experience. We combine traditional barbering techniques with a
          modern, upscale atmosphere.
        </p>
        <p>
          Our expert barbers are artists dedicated to giving you sharp cuts, clean fades, and a
          relaxing time in the chair.
        </p>
      </section>

      <section id="services" className="services">
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <span className="section-sub">What We Offer</span>
          <h2>Our Services</h2>
          <div className="section-divider"></div>
        </div>
        <div className="services-grid">
          {[
            { name: 'Haircut',      price: '₱200', desc: 'Classic haircut with precision trim, shampoo and styling', icon: '✂️' },
            { name: 'Beard Trim',   price: '₱150', desc: 'Precision beard shaping and styling', icon: '🪒' },
            { name: 'Massage',      price: '₱600', desc: 'Relaxing scalp and shoulder massage', icon: '💆' },
            { name: 'Full Service', price: '₱999', desc: 'Complete grooming package — the works', icon: '👑' },
          ].map((s) => (
            <div className="service-card" key={s.name}>
              <span className="service-icon">{s.icon}</span>
              <h3>{s.name}</h3>
              <p className="price">{s.price}</p>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <span className="section-sub">Find Us</span>
        <h2>Visit Us</h2>
        <div className="section-divider"></div>
        <div className="contact-grid">
          <div className="contact-item">
            <span className="contact-item-icon">📍</span>
            <span className="contact-item-label">Location</span>
            <span className="contact-item-value">New Manila, Quezon City</span>
          </div>
          <div className="contact-item">
            <span className="contact-item-icon">📞</span>
            <span className="contact-item-label">Phone</span>
            <span className="contact-item-value">+639302250687</span>
          </div>
          <div className="contact-item">
            <span className="contact-item-icon">🕐</span>
            <span className="contact-item-label">Hours</span>
            <span className="contact-item-value">Mon–Sat, 9am–7pm</span>
          </div>
        </div>
      </section>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
        />
      )}
      {showAppointmentModal && (
        <AppointmentModal onClose={() => setShowAppointmentModal(false)} />
      )}
    </div>
  );
}

// ─── LoginModal ───────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Welcome Back</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          <input type="password" placeholder="Password" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="switch-auth">
          Don't have an account?
          <button onClick={onSwitchToRegister} className="link-btn">Register</button>
        </p>
      </div>
    </div>
  );
}

// ─── RegisterModal ────────────────────────────────────────────────────────────
function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    // Client-side validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => { onClose(); onSwitchToLogin(); }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Create Account</h2>
        {error   && <p className="error">{error}</p>}
        {success && <p className="success">Account created! Redirecting to login…</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username (3–30 chars, letters/numbers/_)" value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          <input type="email" placeholder="Email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <input type="password" placeholder="Password (min 8 characters)" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
        <p className="switch-auth">
          Already have an account?
          <button onClick={onSwitchToLogin} className="link-btn">Login</button>
        </p>
      </div>
    </div>
  );
}

// ─── AppointmentModal (Create) ────────────────────────────────────────────────
function AppointmentModal({ onClose }) {
  const [formData, setFormData] = useState({ phone: '', service: '', date: '', time: '', notes: '' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await apiFetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Book Appointment</h2>
        {error   && <p className="error">{error}</p>}
        {success && <p className="success">Appointment booked successfully! ✓</p>}
        <form onSubmit={handleSubmit}>
          <input type="tel" placeholder="Phone Number" value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <select value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} required>
            <option value="">Select Service</option>
            <option value="Haircut">Haircut — ₱200</option>
            <option value="Beard Trim">Beard Trim — ₱150</option>
            <option value="Massage">Massage — ₱600</option>
            <option value="Full Service">Full Service — ₱999</option>
          </select>
          <input type="date" value={formData.date} min={today}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          <input type="time" value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
          <textarea placeholder="Additional notes (optional)" value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── EditAppointmentModal ─────────────────────────────────────────────────────
// BUG FIX: Was sending the wrong field names and using `|| existing` which
// prevented clearing a field. Now sends correctly and uses controlled inputs.
function EditAppointmentModal({ appointment, onClose, onUpdate }) {
  const [formData, setFormData] = React.useState({
    phone:   appointment.phone   || '',
    service: appointment.service || '',
    // FIX: always normalise to YYYY-MM-DD for the date input
    date:    appointment.appointmentDate
               ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
               : '',
    time:    appointment.appointmentTime || '',
    notes:   appointment.notes   || '',
    status:  appointment.status  || 'Scheduled',
  });
  const [error,   setError]   = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // FIX: send all fields explicitly — no silent falls-back on the client side
      await apiFetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          phone:   formData.phone,
          service: formData.service,
          date:    formData.date,
          time:    formData.time,
          notes:   formData.notes,
          status:  formData.status,
        }),
      });
      setSuccess(true);
      setTimeout(() => onUpdate(), 1200);
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Edit Appointment</h2>
        {error   && <p className="error">{error}</p>}
        {success && <p className="success">Appointment updated! ✓</p>}
        <form onSubmit={handleSubmit}>
          <input type="tel" placeholder="Phone Number" value={formData.phone} required
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <select value={formData.service} required
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
            <option value="Haircut">Haircut — ₱200</option>
            <option value="Beard Trim">Beard Trim — ₱150</option>
            <option value="Massage">Massage — ₱600</option>
            <option value="Full Service">Full Service — ₱999</option>
          </select>
          <input type="date" value={formData.date} required
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          <input type="time" value={formData.time} required
            onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
          <select value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <textarea placeholder="Additional notes (optional)" value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [appointments,      setAppointments]      = React.useState([]);
  const [loading,           setLoading]           = React.useState(true);
  const [error,             setError]             = React.useState('');
  const [editingAppointment, setEditingAppointment] = React.useState(null);

  React.useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/api/appointments');
      setAppointments(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: newStatus } : a));
    try {
      await apiFetch(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update status');
      fetchAppointments(); // Revert
    }
  };

  if (user?.role !== 'admin') return <Navigate to="/" />;

  const counts = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
    completed:  appointments.filter((a) => a.status === 'Completed').length,
    revenue:    appointments.filter((a) => a.status === 'Completed').reduce((s, a) => s + (a.amount || 0), 0),
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header-bar">
        <span className="logo">Rain Days</span>
        <div className="admin-header-bar-sep"></div>
        <span>Admin Panel</span>
        <div style={{marginLeft:'auto', display:'flex', gap:'0.75rem'}}>
          <Link to="/" className="nav-btn" style={{color:'rgba(255,255,255,0.6)', borderColor:'rgba(255,255,255,0.15)', fontSize:'0.8rem'}}>Home</Link>
          <button onClick={logout} className="nav-btn logout-btn" style={{fontSize:'0.8rem'}}>Logout</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-title-row">
          <div>
            <h1>Appointments</h1>
            <p className="admin-subtitle">All bookings · Rain Days Barbershop</p>
          </div>
        </div>
        <div className="admin-stats">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{counts.total}</div></div>
          <div className="stat-card"><div className="stat-label">Scheduled</div><div className="stat-value gold">{counts.scheduled}</div></div>
          <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{counts.completed}</div></div>
          <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value gold">₱{counts.revenue.toLocaleString()}</div></div>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', fontFamily:'DM Mono, monospace', fontSize:'0.85rem', letterSpacing:'1px' }}>Loading appointments…</p>}
        {error   && <p className="error" style={{ margin: '1rem 0' }}>{error}</p>}

        <div className="appointments-table">
          <div className="table-toolbar">
            <span className="table-title">All Bookings</span>
            <span style={{color:'var(--text-faint)', fontSize:'0.8rem', fontFamily:'DM Mono, monospace'}}>{appointments.length} total</span>
          </div>

          {!loading && !error && appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No appointments yet. They'll show up here once customers book.</p>
            </div>
          ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td style={{fontWeight:'500', color:'var(--text-dark)'}}>{apt.customerName}</td>
                  <td>{apt.phone}</td>
                  <td>{apt.service}</td>
                  <td>{new Date(apt.appointmentDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{fontFamily:'DM Mono, monospace', fontSize:'0.85rem'}}>{apt.appointmentTime}</td>
                  <td style={{fontWeight:'600', color:'var(--walnut)'}}>₱{apt.amount?.toLocaleString()}</td>
                  <td>
                    <select
                      className="table-status-select"
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => setEditingAppointment(apt)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(apt._id)}>Delete</button>
                  </td>
                </tr>
              ))}

              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onUpdate={() => { fetchAppointments(); setEditingAppointment(null); }}
        />
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"      element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;