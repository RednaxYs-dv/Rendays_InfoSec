import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';

// --- Home Page Component ---
function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo">DON PEDRO</div>
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
              <button onClick={() => setShowAppointmentModal(true)} className="nav-btn">
                Book Now
              </button>
              <button onClick={logout} className="nav-btn logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="nav-btn">
                Login
              </button>
              <button onClick={() => setShowRegisterModal(true)} className="nav-btn primary">
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Don Pedro Barbershop</h1>
          <p>Classic Cuts & Shaves</p>
          <p className="hero-subtitle">
            Let your hair do the talking. We are the creators of your next fashion statement.
          </p>
          {user && (
            <button onClick={() => setShowAppointmentModal(true)} className="btn-hero">
              Make Appointment
            </button>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <h2>About Don Pedro Barberia</h2>
        <p>
          Founded in the heart of New Manila, <strong>Don Pedro Barberia</strong> is more than just a barbershop – it's a grooming experience.
          We pride ourselves on combining traditional barbering techniques with a modern, upscale atmosphere.
        </p>
        <p>
          Our expert barbers are artists, dedicated to giving you sharp cuts, clean fades, and a relaxing time in the chair.
        </p>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Haircut</h3>
            <p className="price">₱350</p>
            <p>Classic haircut with precision trim, shampoo and styling</p>
          </div>
          <div className="service-card">
            <h3>Beard Trim</h3>
            <p className="price">₱200</p>
            <p>Precision beard shaping and styling</p>
          </div>
          <div className="service-card">
            <h3>Massage</h3>
            <p className="price">₱500</p>
            <p>Relaxing scalp and shoulder massage</p>
          </div>
          <div className="service-card">
            <h3>Full Service</h3>
            <p className="price">₱700</p>
            <p>Complete grooming package</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h2>Visit Us</h2>
        <p>📍 New Manila, Quezon City</p>
        <p>📞 +639754703724</p>
      </section>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal onClose={() => setShowAppointmentModal(false)} />
      )}
    </div>
  );
}

// --- Login Modal Component ---
function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p className="switch-auth">
          Don't have an account? 
          <button onClick={onSwitchToRegister} className="link-btn">Register</button>
        </p>
      </div>
    </div>
  );
}

// --- Register Modal Component ---
function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Registration successful! Redirecting to login...</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p className="switch-auth">
          Already have an account? 
          <button onClick={onSwitchToLogin} className="link-btn">Login</button>
        </p>
      </div>
    </div>
  );
}

// --- Appointment Modal Component ---
function AppointmentModal({ onClose }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      // ✅ Added response.ok check for robust error handling
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to book appointment');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Book Appointment</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Appointment booked successfully!</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            required
          >
            <option value="">Select Service</option>
            <option value="Haircut">Haircut - ₱350</option>
            <option value="Beard Trim">Beard Trim - ₱200</option>
            <option value="Massage">Massage - ₱500</option>
            <option value="Full Service">Full Service - ₱700</option>
          </select>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
          <textarea
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
          <button type="submit" className="btn-primary">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}

// --- Edit Appointment Modal Component ---
function EditAppointmentModal({ appointment, onClose, onUpdate }) {
  const [formData, setFormData] = React.useState({
    phone: appointment.phone,
    service: appointment.service,
    // Ensure date is in YYYY-MM-DD format for input type="date"
    date: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '', 
    time: appointment.appointmentTime,
    notes: appointment.notes || '',
    status: appointment.status
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      // ✅ Added response.ok check for robust error handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appointment');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onUpdate(); // This correctly triggers fetchAppointments()
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Edit Appointment</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Appointment updated successfully!</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            required
          >
            <option value="Haircut">Haircut - ₱350</option>
            <option value="Beard Trim">Beard Trim - ₱200</option>
            <option value="Massage">Massage - ₱500</option>
            <option value="Full Service">Full Service - ₱700</option>
          </select>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            required
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <textarea
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
          <button type="submit" className="btn-primary">Update Appointment</button>
        </form>
      </div>
    </div>
  );
}

// --- Admin Dashboard Component with CRUD ---
function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [editingAppointment, setEditingAppointment] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);

  React.useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // ✅ Added response.ok check
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }

      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // ✅ Added response.ok check
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete appointment');
      }

      const data = await response.json();

      if (data.success) {
        alert('Appointment deleted successfully!');
        // ✅ The refresh is correct here
        fetchAppointments(); 
      } else {
        alert(data.message || 'Failed to delete appointment');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // ✅ OPTIMISTIC STATE UPDATE for better UX (update locally while API runs)
      setAppointments(prevApts => 
        prevApts.map(apt => apt._id === id ? { ...apt, status: newStatus } : apt)
      );

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // ✅ Added response.ok check
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();

      if (data.success) {
        // ✅ Full refresh confirms the backend data, which is safer
        fetchAppointments(); 
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err.message || 'Failed to update status');
      // If the API call fails, revert the state change (pessimistic revert)
      fetchAppointments();
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <div className="logo">DON PEDRO - Admin</div>
        <div className="auth-buttons">
          <Link to="/" className="nav-btn">Home</Link>
          <button onClick={logout} className="nav-btn logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <h1>Appointments Dashboard</h1>
        
        {loading && <p style={{ color: '#d4a574', textAlign: 'center', padding: '2rem' }}>Loading appointments...</p>}
        
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && appointments.length === 0 && (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>
            No appointments yet. Book one to see it here!
          </p>
        )}
        
        {!loading && !error && appointments.length > 0 && (
          <div className="appointments-table">
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
                    <td>{apt.customerName}</td>
                    <td>{apt.phone}</td>
                    <td>{apt.service}</td>
                    <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                    <td>{apt.appointmentTime}</td>
                    <td>₱{apt.amount}</td>
                    <td>
                      <select 
                        value={apt.status}
                        onChange={(e) => handleUpdateStatus(apt._id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '5px',
                          border: '1px solid #444',
                          background: '#333',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEdit(apt)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#4CAF50',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(apt._id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#dc3545',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && editingAppointment && (
        <EditAppointmentModal 
          appointment={editingAppointment}
          onClose={() => {
            setShowEditModal(false);
            setEditingAppointment(null);
          }}
          onUpdate={() => {
            fetchAppointments();
            setShowEditModal(false);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
}

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;