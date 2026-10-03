import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, Link } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = sessionStorage.getItem('keskese_admin') === 'true';
  const adminUser = JSON.parse(sessionStorage.getItem('keskese_admin_user') || '{}');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Super Admin check
  const isSuperAdmin = adminUser?.role === 'superadmin' || 
                       adminUser?.username === 'taddeal' || 
                       adminUser?.email === 'taddealmoges@gmail.com';

  // Modal State for adding admins
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [adminList, setAdminList] = useState([]);
  const [showExistingAdmins, setShowExistingAdmins] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [adminError, setAdminError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost/keskese/api' : '/api';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${baseUrl}/admins.php?_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.records)) {
        setAdminList(json.records);
      }
    } catch (e) {}
  };

  const openAdminModal = () => {
    setShowAdminModal(true);
    setAdminFeedback(null);
    setAdminError(null);
    loadAdmins();
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError(null);
    setAdminFeedback(null);

    try {
      const res = await fetch(`${baseUrl}/admins.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      const json = await res.json();

      if (res.ok && json.status === 'success') {
        setAdminFeedback('Admin user added successfully!');
        setNewAdmin({ username: '', email: '', password: '', role: 'admin' });
        loadAdmins();
        setTimeout(() => {
          setAdminFeedback(null);
          setShowAdminModal(false);
        }, 1500);
      } else {
        setAdminError(json.message || 'Failed to add administrator.');
      }
    } catch (err) {
      setAdminError('Network error while creating administrator.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (id, targetUsername) => {
    if (window.confirm(`Are you sure you want to remove administrator "${targetUsername}"?`)) {
      try {
        const res = await fetch(`${baseUrl}/admins.php?action=delete&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'delete' })
        });
        const json = await res.json();
        if (json.status === 'success') {
          loadAdmins();
        } else {
          alert(json.message || 'Failed to delete administrator.');
        }
      } catch (e) {
        alert('Network error while removing administrator.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('keskese_admin');
    sessionStorage.removeItem('keskese_admin_user');
    sessionStorage.removeItem('keskese_token');
    window.location.href = '/admin/login';
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    background: isActive ? '#1A6B3C' : 'transparent',
    color: isActive ? '#FFFFFF' : '#9CA3AF',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem'
  });

  return (
    <div style={{minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column'}}>
      {/* Top Admin Header */}
      <header style={{
        background: '#111827',
        color: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '3px solid #1A6B3C',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div className="container" style={{maxWidth: '1300px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem'}}>
          
          {/* Logo & Title */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <img src="/logo.png" alt="Keskese Logo" style={{width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #D4A843'}} />
            <div>
              <div style={{fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', lineHeight: 1.1}}>
                Keskese Admin Control
              </div>
              <div style={{fontSize: '0.75rem', color: '#9CA3AF'}}>
                Netherlands Association Management
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}} className="hidden-mobile">
            <NavLink to="/admin/dashboard" style={navLinkStyle}>
              📊 Dashboard
            </NavLink>

            <NavLink to="/admin/news" style={navLinkStyle}>
              📰 News & Events
            </NavLink>

            <NavLink to="/admin/members" style={navLinkStyle}>
              👥 Members
            </NavLink>

            <NavLink to="/admin/contacts" style={navLinkStyle}>
              📩 Inquiries
            </NavLink>

            <NavLink to="/admin/finances" style={navLinkStyle}>
              💳 Finances
            </NavLink>

            <NavLink to="/admin/member-view" style={navLinkStyle}>
              🔍 Statements
            </NavLink>
          </nav>

          {/* Right Action Buttons & User Info */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.65rem'}}>
            
            {/* Super Admin Add Button */}
            {isSuperAdmin && (
              <button 
                onClick={openAdminModal}
                style={{
                  background: 'linear-gradient(135deg, #D4A843 0%, #B8860B 100%)',
                  color: '#111827',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(212,168,67,0.3)',
                  transition: 'transform 0.15s ease'
                }}
                title="Super Admin: Manage Administrators"
              >
                👑 Add Admin
              </button>
            )}

            {adminUser?.email && (
              <span style={{
                fontSize: '0.8rem', color: '#D1D5DB', background: '#1F2937',
                padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #374151'
              }} className="hidden-mobile">
                👤 {adminUser.email}
              </span>
            )}

            <Link 
              to="/" 
              target="_blank"
              style={{
                color: '#D4A843', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
                padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(212,168,67,0.15)',
                border: '1px solid rgba(212,168,67,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              Live Site ↗
            </Link>

            <button 
              onClick={handleLogout}
              style={{
                background: '#374151', color: '#F9FAFB', border: 'none',
                padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#C23B22'}
              onMouseLeave={e => e.target.style.background = '#374151'}
            >
              Logout 🚪
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Content Body */}
      <main style={{flex: 1, padding: '2rem 1rem'}}>
        <Outlet />
      </main>

      {/* Super Admin Modal Popup (Disappears after adding) */}
      {showAdminModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '1.1rem 1.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #D4A843'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.2rem'}}>👑</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>Super Admin: Add Admin</span>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                style={{
                  background: 'transparent', border: 'none', color: '#9CA3AF',
                  fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <div style={{padding: '1.5rem'}}>
              
              {adminFeedback && (
                <div style={{
                  background: '#E8F5EE', color: '#1A6B3C', padding: '0.75rem 1rem',
                  borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.88rem',
                  border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  ✅ {adminFeedback}
                </div>
              )}

              {adminError && (
                <div style={{
                  background: '#FDE8E8', color: '#C23B22', padding: '0.75rem 1rem',
                  borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.88rem',
                  border: '1px solid #F8B4B4'
                }}>
                  ⚠️ {adminError}
                </div>
              )}

              <form onSubmit={handleAddAdmin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {/* Username */}
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: '0.35rem'}}>
                    Username <span style={{color: '#C23B22'}}>*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. michael"
                    value={newAdmin.username}
                    onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: '0.35rem'}}>
                    Email Address <span style={{color: '#C23B22'}}>*</span>
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. admin@example.com"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: '0.35rem'}}>
                    Password <span style={{color: '#C23B22'}}>*</span>
                  </label>
                  <div style={{position: 'relative'}}>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter secure password"
                      value={newAdmin.password}
                      onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                      style={{
                        width: '100%', padding: '0.65rem 2.4rem 0.65rem 0.85rem', borderRadius: '8px',
                        border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#6B7280'
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.84rem', color: '#374151', marginBottom: '0.35rem'}}>
                    Role <span style={{color: '#C23B22'}}>*</span>
                  </label>
                  <select 
                    value={newAdmin.role}
                    onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', background: '#FFFFFF'
                    }}
                  >
                    <option value="admin">Standard Admin (admin)</option>
                    <option value="superadmin">Super Admin (full privileges)</option>
                  </select>
                </div>

                {/* Actions */}
                <div style={{display: 'flex', gap: '0.75rem', marginTop: '0.5rem'}}>
                  <button 
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    style={{
                      flex: 1, padding: '0.65rem', borderRadius: '8px',
                      background: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB',
                      fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit"
                    disabled={adminLoading}
                    style={{
                      flex: 2, padding: '0.65rem', borderRadius: '8px',
                      background: '#1A6B3C', color: '#FFFFFF', border: 'none',
                      fontSize: '0.88rem', fontWeight: 700, cursor: adminLoading ? 'not-allowed' : 'pointer',
                      opacity: adminLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    {adminLoading ? 'Saving...' : '💾 Save Admin'}
                  </button>
                </div>

              </form>

              {/* View Existing Admins Accordion */}
              <div style={{marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB'}}>
                <button 
                  type="button"
                  onClick={() => setShowExistingAdmins(!showExistingAdmins)}
                  style={{
                    background: 'none', border: 'none', color: '#1E3A5F', fontSize: '0.82rem',
                    fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}
                >
                  <span>{showExistingAdmins ? '▼' : '▶'}</span>
                  <span>View Existing Administrators ({adminList.length})</span>
                </button>

                {showExistingAdmins && (
                  <div style={{marginTop: '0.75rem', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {adminList.map(a => (
                      <div 
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#F9FAFB',
                          border: '1px solid #E5E7EB', fontSize: '0.82rem'
                        }}
                      >
                        <div>
                          <span style={{fontWeight: 700, color: '#111827'}}>{a.username}</span>
                          <span style={{color: '#6B7280', marginLeft: '0.4rem'}}>({a.email})</span>
                          <span style={{
                            marginLeft: '0.5rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                            background: a.role === 'superadmin' ? '#FEF3C7' : '#E5E7EB',
                            color: a.role === 'superadmin' ? '#92400E' : '#374151',
                            fontWeight: 600, fontSize: '0.72rem'
                          }}>
                            {a.role}
                          </span>
                        </div>

                        {a.username !== 'taddeal' && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteAdmin(a.id, a.username)}
                            style={{
                              background: '#FDE8E8', color: '#C23B22', border: 'none',
                              padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem',
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
