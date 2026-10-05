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
  const [adminModalTab, setAdminModalTab] = useState('add');
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [adminList, setAdminList] = useState([]);
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

            <NavLink to="/admin/governance" style={navLinkStyle}>
              🏛️ Org & Meetings
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

            {(adminUser?.username || adminUser?.email) && (
              <span style={{
                fontSize: '0.82rem', color: '#F3F4F6', background: '#1F2937',
                padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #374151',
                fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
              }} className="hidden-mobile">
                👤 {adminUser.username || adminUser.email}
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

      {/* Super Admin Modal Popup (Tabbed: Add Admin & View Admins) */}
      {showAdminModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #D4A843'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.2rem'}}>👑</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>Super Admin Portal</span>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                style={{
                  background: 'transparent', border: 'none', color: '#9CA3AF',
                  fontSize: '1.25rem', cursor: 'pointer', padding: '0.2rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div style={{
              display: 'flex', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.35rem 0.5rem', gap: '0.5rem'
            }}>
              <button
                type="button"
                onClick={() => setAdminModalTab('add')}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s ease',
                  background: adminModalTab === 'add' ? '#1A6B3C' : 'transparent',
                  color: adminModalTab === 'add' ? '#FFFFFF' : '#64748B'
                }}
              >
                ➕ Add Admin User
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminModalTab('list');
                  loadAdmins();
                }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s ease',
                  background: adminModalTab === 'list' ? '#1A6B3C' : 'transparent',
                  color: adminModalTab === 'list' ? '#FFFFFF' : '#64748B'
                }}
              >
                👥 View Admins ({adminList.length})
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div style={{padding: '1.4rem', overflowY: 'auto', flex: 1}}>
              
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

              {/* TAB 1: ADD ADMIN FORM */}
              {adminModalTab === 'add' && (
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
                        placeholder="Enter password"
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
              )}

              {/* TAB 2: VIEW ADMINISTRATORS LIST */}
              {adminModalTab === 'list' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                    <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#374151'}}>
                      Registered Admins ({adminList.length})
                    </span>
                    <button
                      type="button"
                      onClick={loadAdmins}
                      style={{
                        background: '#EBF0F7', color: '#1E3A5F', border: 'none', padding: '0.25rem 0.55rem',
                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.65rem'}}>
                    {adminList.map(a => (
                      <div 
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem', borderRadius: '10px', background: '#F8FAFC',
                          border: '1px solid #E2E8F0', fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem'}}>
                            <span style={{fontWeight: 700, color: '#0F172A', fontSize: '0.92rem'}}>
                              {a.username}
                            </span>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: '50px',
                              background: a.role === 'superadmin' ? '#FEF3C7' : '#E0E7FF',
                              color: a.role === 'superadmin' ? '#92400E' : '#3730A3',
                              fontWeight: 700, fontSize: '0.72rem'
                            }}>
                              {a.role === 'superadmin' ? '👑 superadmin' : '🛡️ admin'}
                            </span>
                          </div>
                          <div style={{color: '#64748B', fontSize: '0.8rem'}}>
                            ✉️ {a.email}
                          </div>
                        </div>

                        {a.username !== 'taddeal' && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteAdmin(a.id, a.username)}
                            style={{
                              background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5',
                              padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem',
                              fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s ease'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    ))}

                    {adminList.length === 0 && (
                      <div style={{textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8'}}>
                        No administrators found.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
