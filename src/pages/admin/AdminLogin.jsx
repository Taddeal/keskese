import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
      
      if (password === correctPassword) {
        sessionStorage.setItem('keskese_admin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #152D4A 0%, #1A6B3C 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #145A30 100%)',
          padding: '2.5rem 2rem 2rem',
          textAlign: 'center',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', background: '#FFFFFF',
            margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '3px solid #D4A843', overflow: 'hidden'
          }}>
            <img src="/logo.png" alt="Keskese Milash Logo" style={{width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover'}} />
          </div>
          <h2 style={{margin: '0 0 0.3rem', fontSize: '1.5rem', fontWeight: 800}}>Admin Control Portal</h2>
          <p style={{margin: 0, opacity: 0.85, fontSize: '0.9rem'}}>Association Keskese Milash Netherlands & Worldwide</p>
        </div>

        {/* Login Form Body */}
        <div style={{padding: '2.25rem 2rem'}}>
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: '0.4rem'}}>
                <span>🔐</span> Access Password
              </label>
              
              <div style={{position: 'relative'}}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  style={{
                    width: '100%', padding: '0.85rem 2.75rem 0.85rem 1rem', borderRadius: '10px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none',
                    transition: 'border-color 0.2s ease', background: '#FAFAF8'
                  }} 
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.6
                  }}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>

              {error && (
                <div style={{
                  color: '#C23B22', background: '#FDE8E8', padding: '0.6rem 0.85rem',
                  borderRadius: '8px', fontSize: '0.85rem', marginTop: '0.6rem', border: '1px solid #F8B4B4'
                }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '10px',
                background: 'linear-gradient(135deg, #1A6B3C 0%, #145A30 100%)',
                color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(26,107,60,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem'
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          {/* Helper hint & back link */}
          <div style={{marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6', textAlign: 'center'}}>
            <p style={{margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#9CA3AF'}}>
              🔑 Password hint: <code style={{background: '#F3F4F6', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#1F2937'}}>admin123</code>
            </p>
            <Link to="/" style={{color: '#1A6B3C', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600}}>
              ← Back to Main Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
