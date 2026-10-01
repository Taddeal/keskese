import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please provide both username/email and password.');
      setLoading(false);
      return;
    }

    try {
      const baseUrl = window.location.origin.includes('localhost')
        ? 'http://localhost/keskese/api'
        : '/api';

      const response = await fetch(`${baseUrl}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if (response.ok && json.status === 'success') {
          sessionStorage.setItem('keskese_admin', 'true');
          sessionStorage.setItem('keskese_admin_user', JSON.stringify(json.user || { username: cleanUsername }));
          if (json.token) sessionStorage.setItem('keskese_token', json.token);
          navigate('/admin/dashboard');
          return;
        } else {
          setError(json.message || 'Invalid username or password.');
          setLoading(false);
          return;
        }
      } else {
        // Non-JSON response (e.g., static Vercel preview rewrite or offline API)
        throw new Error('API offline or returned non-JSON response');
      }
    } catch (err) {
      console.warn('Backend DB login check failed, evaluating fallback credentials:', err);

      // Offline / Deployment fallback so user is never locked out on Vercel preview or before DB setup
      const isDefaultUser = (
        cleanUsername.toLowerCase() === 'taddealmoges@gmail.com' || 
        cleanUsername.toLowerCase() === 'taddeal'
      );
      const isDefaultPass = cleanPassword === '01010991Tad!@#';

      if (isDefaultUser && isDefaultPass) {
        sessionStorage.setItem('keskese_admin', 'true');
        sessionStorage.setItem('keskese_admin_user', JSON.stringify({
          username: 'taddeal',
          email: 'taddealmoges@gmail.com',
          role: 'admin'
        }));
        navigate('/admin/dashboard');
        return;
      } else {
        setError('Invalid username or password. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
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
        maxWidth: '430px',
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
          <p style={{margin: 0, opacity: 0.85, fontSize: '0.9rem'}}>Association Keskese Milash Netherlands</p>
        </div>

        {/* Login Form Body */}
        <div style={{padding: '2.25rem 2rem'}}>
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            
            {/* Username / Email field */}
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: '0.4rem'}}>
                <span>👤</span> Username or Email
              </label>
              <input 
                type="text" 
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s ease', background: '#FAFAF8'
                }} 
                placeholder="e.g. admin@example.com or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Password field */}
            <div className="form-group">
              <label style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: '0.4rem'}}>
                <span>🔐</span> Password
              </label>
              
              <div style={{position: 'relative'}}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  style={{
                    width: '100%', padding: '0.85rem 2.75rem 0.85rem 1rem', borderRadius: '10px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.95rem', outline: 'none',
                    transition: 'border-color 0.2s ease', background: '#FAFAF8'
                  }} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                  color: '#C23B22', background: '#FDE8E8', padding: '0.7rem 0.9rem',
                  borderRadius: '8px', fontSize: '0.85rem', marginTop: '0.75rem', border: '1px solid #F8B4B4'
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
              {loading ? 'Authenticating with DB...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          {/* Back link */}
          <div style={{marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6', textAlign: 'center'}}>
            <Link to="/" style={{color: '#1A6B3C', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600}}>
              ← Back to Main Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
