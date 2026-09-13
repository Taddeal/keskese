import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, Link } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = sessionStorage.getItem('keskese_admin') === 'true';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('keskese_admin');
    window.location.href = '/admin/login';
  };

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
        <div className="container" style={{maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem'}}>
          
          {/* Logo & Title */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <img src="/logo.png" alt="Keskese Logo" style={{width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #D4A843'}} />
            <div>
              <div style={{fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', lineHeight: 1.1}}>
                Keskese Admin Control
              </div>
              <div style={{fontSize: '0.75rem', color: '#9CA3AF'}}>
                Netherlands & Worldwide Association Management
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}} className="hidden-mobile">
            <NavLink 
              to="/admin/dashboard" 
              style={({isActive}) => ({
                padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s ease',
                background: isActive ? '#1A6B3C' : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF'
              })}
            >
              📊 Dashboard
            </NavLink>

            <NavLink 
              to="/admin/news" 
              style={({isActive}) => ({
                padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s ease',
                background: isActive ? '#1A6B3C' : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF'
              })}
            >
              📰 News & Events
            </NavLink>

            <NavLink 
              to="/admin/members" 
              style={({isActive}) => ({
                padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s ease',
                background: isActive ? '#1A6B3C' : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF'
              })}
            >
              👥 Member Directory
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Link 
              to="/" 
              target="_blank"
              style={{
                color: '#D4A843', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                padding: '0.4rem 0.85rem', borderRadius: '6px', background: 'rgba(212,168,67,0.15)',
                border: '1px solid rgba(212,168,67,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              Live Site ↗
            </Link>

            <button 
              onClick={handleLogout}
              style={{
                background: '#374151', color: '#F9FAFB', border: 'none',
                padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem',
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
      <main style={{flex: 1, padding: '2.5rem 1rem'}}>
        <Outlet />
      </main>
    </div>
  );
}
