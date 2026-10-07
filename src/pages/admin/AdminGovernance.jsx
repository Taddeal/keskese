import React, { useState, useEffect } from 'react';

export default function AdminGovernance() {
  const [activeTab, setActiveTab] = useState('leadership'); // 'leadership' | 'meetings'

  // Admin user
  const adminUser = JSON.parse(sessionStorage.getItem('keskese_admin_user') || '{}');

  const baseUrl = window.location.origin.includes('localhost') 
    ? 'http://localhost/keskese/api' 
    : '/api';

  // ----------------------------------------------------
  // 1. LEADERSHIP STATE & HANDLERS
  // ----------------------------------------------------
  const [leaders, setLeaders] = useState([]);
  const [availableTerms, setAvailableTerms] = useState(['2026-2028']);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [editingLeaderId, setEditingLeaderId] = useState(null);
  const [leaderForm, setLeaderForm] = useState({
    term: '2026-2028',
    category: 'Parliament Leaders',
    name: '',
    role_title: '',
    phone: '',
    email: ''
  });
  const [leaderStatus, setLeaderStatus] = useState({ loading: false, message: null, error: null });

  const loadLeaders = async () => {
    try {
      const query = selectedTerm !== 'all' ? `?term=${encodeURIComponent(selectedTerm)}&_t=${Date.now()}` : `?_t=${Date.now()}`;
      const res = await fetch(`${baseUrl}/leadership.php${query}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.status === 'success') {
        setLeaders(json.records || []);
        if (json.terms && json.terms.length > 0) {
          setAvailableTerms(json.terms);
        }
      }
    } catch (err) {
      console.warn('Failed to load leadership data:', err);
    }
  };

  const handleLeaderSubmit = async (e) => {
    e.preventDefault();
    if (!leaderForm.name.trim()) {
      setLeaderStatus({ loading: false, message: null, error: 'Leader name is required.' });
      return;
    }

    setLeaderStatus({ loading: true, message: null, error: null });
    try {
      const payload = editingLeaderId ? { id: editingLeaderId, ...leaderForm } : leaderForm;
      const res = await fetch(`${baseUrl}/leadership.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.status === 'success') {
        setLeaderStatus({
          loading: false,
          message: editingLeaderId ? 'Leader updated successfully!' : 'Leader added successfully!',
          error: null
        });
        setEditingLeaderId(null);
        setLeaderForm({
          term: leaderForm.term || '2026-2028',
          category: 'Parliament Leaders',
          name: '',
          role_title: '',
          phone: '',
          email: ''
        });
        loadLeaders();
        setTimeout(() => setLeaderStatus({ loading: false, message: null, error: null }), 3000);
      } else {
        setLeaderStatus({ loading: false, message: null, error: json.message || 'Failed to save leader.' });
      }
    } catch (err) {
      setLeaderStatus({ loading: false, message: null, error: err.message });
    }
  };

  const handleEditLeader = (leader) => {
    setEditingLeaderId(leader.id);
    setLeaderForm({
      term: leader.term,
      category: leader.category,
      name: leader.name,
      role_title: leader.role_title || '',
      phone: leader.phone || '',
      email: leader.email || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLeader = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from leadership?`)) {
      try {
        const res = await fetch(`${baseUrl}/leadership.php?action=delete&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'delete' })
        });
        const json = await res.json();
        if (json.status === 'success') {
          loadLeaders();
        } else {
          alert(json.message || 'Failed to delete leader.');
        }
      } catch (e) {
        alert('Network error while deleting leader.');
      }
    }
  };

  const resetLeaderForm = () => {
    setEditingLeaderId(null);
    setLeaderForm({
      term: '2026-2028',
      category: 'Parliament Leaders',
      name: '',
      role_title: '',
      phone: '',
      email: ''
    });
  };

  // ----------------------------------------------------
  // 2. MEETINGS STATE & HANDLERS
  // ----------------------------------------------------
  const [meetings, setMeetings] = useState([]);
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meeting_date: new Date().toISOString().split('T')[0],
    start_time: '12:00',
    end_time: '13:00',
    meeting_type: 'Leadership Meeting',
    location: 'Community Hall',
    attendees: '',
    issues_discussed: '',
    status: 'Scheduled'
  });
  const [meetingStatus, setMeetingStatus] = useState({ loading: false, message: null, error: null });

  const loadMeetings = async () => {
    try {
      const query = meetingFilter !== 'all' ? `?type=${encodeURIComponent(meetingFilter)}&_t=${Date.now()}` : `?_t=${Date.now()}`;
      const res = await fetch(`${baseUrl}/meetings.php${query}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.status === 'success') {
        setMeetings(json.records || []);
      }
    } catch (err) {
      console.warn('Failed to load meetings data:', err);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) {
      setMeetingStatus({ loading: false, message: null, error: 'Meeting topic/title is required.' });
      return;
    }

    setMeetingStatus({ loading: true, message: null, error: null });
    try {
      const payload = {
        ...(editingMeetingId ? { id: editingMeetingId } : {}),
        ...meetingForm,
        created_by: adminUser?.username || 'admin'
      };

      const res = await fetch(`${baseUrl}/meetings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.status === 'success') {
        setMeetingStatus({
          loading: false,
          message: editingMeetingId ? 'Meeting report updated successfully!' : 'Meeting recorded successfully!',
          error: null
        });
        setEditingMeetingId(null);
        setMeetingForm({
          title: '',
          meeting_date: new Date().toISOString().split('T')[0],
          start_time: '12:00',
          end_time: '13:00',
          meeting_type: 'Leadership Meeting',
          location: 'Community Hall',
          attendees: '',
          issues_discussed: '',
          status: 'Scheduled'
        });
        loadMeetings();
        setTimeout(() => setMeetingStatus({ loading: false, message: null, error: null }), 3000);
      } else {
        setMeetingStatus({ loading: false, message: null, error: json.message || 'Failed to save meeting.' });
      }
    } catch (err) {
      setMeetingStatus({ loading: false, message: null, error: err.message });
    }
  };

  const handleEditMeeting = (m) => {
    setEditingMeetingId(m.id);
    setMeetingForm({
      title: m.title,
      meeting_date: m.meeting_date,
      start_time: m.start_time || '12:00',
      end_time: m.end_time || '13:00',
      meeting_type: m.meeting_type || 'Leadership Meeting',
      location: m.location || 'Community Hall',
      attendees: m.attendees || '',
      issues_discussed: m.issues_discussed || '',
      status: m.status || 'Scheduled'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMeeting = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete meeting record "${title}"?`)) {
      try {
        const res = await fetch(`${baseUrl}/meetings.php?action=delete&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'delete' })
        });
        const json = await res.json();
        if (json.status === 'success') {
          loadMeetings();
        } else {
          alert(json.message || 'Failed to delete meeting.');
        }
      } catch (e) {
        alert('Network error while deleting meeting.');
      }
    }
  };

  const resetMeetingForm = () => {
    setEditingMeetingId(null);
    setMeetingForm({
      title: '',
      meeting_date: new Date().toISOString().split('T')[0],
      start_time: '12:00',
      end_time: '13:00',
      meeting_type: 'Leadership Meeting',
      location: 'Community Hall',
      attendees: '',
      issues_discussed: '',
      status: 'Scheduled'
    });
  };

  useEffect(() => {
    if (activeTab === 'leadership') {
      loadLeaders();
    } else {
      loadMeetings();
    }
  }, [activeTab, selectedTerm, meetingFilter]);

  // Group leaders by Term and Category
  const groupedByTerm = leaders.reduce((acc, l) => {
    const t = l.term || 'Current';
    if (!acc[t]) acc[t] = { parliament: [], executive: [], other: [] };
    if (l.category === 'Parliament Leaders') {
      acc[t].parliament.push(l);
    } else if (l.category === 'Executive Leaders') {
      acc[t].executive.push(l);
    } else {
      acc[t].other.push(l);
    }
    return acc;
  }, {});

  return (
    <div className="container" style={{maxWidth: '1200px'}}>
      
      {/* Top Header */}
      <div style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem'}}>
          <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0}}>
            🏛️ Governance & Meetings
          </h1>
          <span style={{
            fontSize: '0.78rem', background: '#FEF3C7', color: '#92400E',
            padding: '0.2rem 0.65rem', borderRadius: '50px', fontWeight: 700, border: '1px solid #FDE68A'
          }}>
            Keskese Management
          </span>
        </div>
        <p style={{color: '#6B7280', margin: 0, fontSize: '0.95rem'}}>
          Manage association leadership structure (Parliament & Executive branches) and record meeting minutes & reports.
        </p>
      </div>

      {/* Main Tab Controls */}
      <div style={{display: 'flex', gap: '1rem', borderBottom: '2px solid #E5E7EB', marginBottom: '2rem'}}>
        <button 
          type="button"
          onClick={() => setActiveTab('leadership')}
          style={{
            padding: '0.75rem 1.5rem', background: 'none', border: 'none',
            borderBottom: activeTab === 'leadership' ? '3px solid #1A6B3C' : '3px solid transparent',
            color: activeTab === 'leadership' ? '#1A6B3C' : '#6B7280', fontWeight: 700,
            fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem'
          }}
        >
          <span>🏛️</span> Organization & Leaders Structure
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('meetings')}
          style={{
            padding: '0.75rem 1.5rem', background: 'none', border: 'none',
            borderBottom: activeTab === 'meetings' ? '3px solid #1A6B3C' : '3px solid transparent',
            color: activeTab === 'meetings' ? '#1A6B3C' : '#6B7280', fontWeight: 700,
            fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem'
          }}
        >
          <span>📅</span> Meetings & Reports Planning
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LEADERSHIP & ORGANIZATION STRUCTURE */}
      {/* ======================================================== */}
      {activeTab === 'leadership' && (
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '2rem', alignItems: 'start'}}>
          
          {/* Left Form: Add / Edit Leader */}
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
            borderTop: editingLeaderId ? '5px solid #D4A843' : '5px solid #1A6B3C'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0}}>
                {editingLeaderId ? '✏️ Update Leader' : '➕ Add Leadership Member'}
              </h2>
              {editingLeaderId && (
                <button
                  type="button"
                  onClick={resetLeaderForm}
                  style={{background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline'}}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {leaderStatus.message && (
              <div style={{background: '#DCFCE7', color: '#15803D', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600}}>
                ✅ {leaderStatus.message}
              </div>
            )}

            {leaderStatus.error && (
              <div style={{background: '#FDE8E8', color: '#C23B22', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600}}>
                ⚠️ {leaderStatus.error}
              </div>
            )}

            <form onSubmit={handleLeaderSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {/* Term / Years */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Leadership Term (e.g. 2026-2028) <span style={{color: '#C23B22'}}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 2026-2028"
                  value={leaderForm.term}
                  onChange={e => setLeaderForm({...leaderForm, term: e.target.value})}
                  style={{width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'}}
                />
              </div>

              {/* Branch / Category */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Branch Category <span style={{color: '#C23B22'}}>*</span>
                </label>
                <select
                  value={leaderForm.category}
                  onChange={e => setLeaderForm({...leaderForm, category: e.target.value})}
                  style={{width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', background: '#FFF'}}
                >
                  <option value="Parliament Leaders">Parliament Leaders (ናይ ባይቶ መሪሕነት)</option>
                  <option value="Executive Leaders">Executive Leaders (ፈጻሚ ኣካል)</option>
                  <option value="Advisory Committee">Advisory Committee (ኣማኻሪ ሽማግለ)</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Leader Full Name <span style={{color: '#C23B22'}}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Sened Luul or Dawit Luu"
                  value={leaderForm.name}
                  onChange={e => setLeaderForm({...leaderForm, name: e.target.value})}
                  style={{width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'}}
                />
              </div>

              {/* Title / Role */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Position / Title (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Chairperson, Secretary, Director"
                  value={leaderForm.role_title}
                  onChange={e => setLeaderForm({...leaderForm, role_title: e.target.value})}
                  style={{width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'}}
                />
              </div>

              {/* Contact Phone & Email */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Phone (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="Phone"
                    value={leaderForm.phone}
                    onChange={e => setLeaderForm({...leaderForm, phone: e.target.value})}
                    style={{width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Email (Optional)
                  </label>
                  <input 
                    type="email"
                    placeholder="Email"
                    value={leaderForm.email}
                    onChange={e => setLeaderForm({...leaderForm, email: e.target.value})}
                    style={{width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none'}}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={leaderStatus.loading}
                style={{
                  marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: 'none',
                  background: editingLeaderId ? '#D4A843' : '#1A6B3C', color: '#FFFFFF', fontWeight: 700,
                  fontSize: '0.95rem', cursor: leaderStatus.loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {leaderStatus.loading ? 'Saving...' : (editingLeaderId ? '💾 Update Leader Details' : '➕ Save Leader')}
              </button>
            </form>
          </div>

          {/* Right Display: Organization Directory Tree */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            
            {/* Filter by Term Bar */}
            <div style={{
              background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px',
              border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
            }}>
              <div style={{fontWeight: 700, color: '#111827', fontSize: '0.95rem'}}>
                👥 Organization Structure Overview
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '0.85rem', color: '#6B7280'}}>Filter Term:</span>
                <select
                  value={selectedTerm}
                  onChange={e => setSelectedTerm(e.target.value)}
                  style={{padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', fontWeight: 600, background: '#FFF'}}
                >
                  <option value="all">All Terms (ኩሉ ዓመታት)</option>
                  {availableTerms.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Terms and Branches */}
            {Object.keys(groupedByTerm).map(term => (
              <div key={term} style={{
                background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden'
              }}>
                {/* Term Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
                  color: '#FFFFFF', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{fontSize: '1.25rem'}}>📜</span>
                    <span style={{fontWeight: 800, fontSize: '1.1rem'}}>Leaders {term}</span>
                  </div>
                  <span style={{fontSize: '0.8rem', color: '#D4A843', fontWeight: 700, letterSpacing: '0.05em'}}>
                    Active Administration
                  </span>
                </div>

                {/* Branches Grid */}
                <div style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  
                  {/* Branch 1: Parliament Leaders */}
                  <div style={{
                    background: '#F8FAFC', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '1.25rem'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #CBD5E1', paddingBottom: '0.5rem'}}>
                      <span style={{fontSize: '1.2rem'}}>🏛️</span>
                      <div>
                        <div style={{fontWeight: 800, color: '#1E293B', fontSize: '0.98rem'}}>Parliament Leaders</div>
                        <div style={{fontSize: '0.75rem', color: '#64748B'}}>ናይ ባይቶ መሪሕነት</div>
                      </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.65rem'}}>
                      {groupedByTerm[term].parliament.map(leader => (
                        <div key={leader.id} style={{
                          background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <div>
                            <div className="notranslate" translate="no" style={{fontWeight: 700, color: '#0F172A', fontSize: '0.95rem'}}>{leader.name}</div>
                            {leader.role_title && (
                              <div style={{fontSize: '0.8rem', color: '#1A6B3C', fontWeight: 600}}>{leader.role_title}</div>
                            )}
                            {(leader.phone || leader.email) && (
                              <div style={{fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem'}}>
                                {leader.phone} {leader.email && `• ${leader.email}`}
                              </div>
                            )}
                          </div>
                          <div style={{display: 'flex', gap: '0.35rem'}}>
                            <button
                              onClick={() => handleEditLeader(leader)}
                              style={{padding: '0.3rem 0.55rem', borderRadius: '4px', background: '#EBF0F7', color: '#1E3A5F', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'}}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteLeader(leader.id, leader.name)}
                              style={{padding: '0.3rem 0.55rem', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'}}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}

                      {groupedByTerm[term].parliament.length === 0 && (
                        <div style={{fontSize: '0.85rem', color: '#94A3B8', padding: '1rem', textAlign: 'center'}}>
                          No parliament leaders added for this term yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Branch 2: Executive Leaders */}
                  <div style={{
                    background: '#F0FDF4', borderRadius: '12px', border: '1.5px solid #BBF7D0', padding: '1.25rem'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #86EFAC', paddingBottom: '0.5rem'}}>
                      <span style={{fontSize: '1.2rem'}}>👔</span>
                      <div>
                        <div style={{fontWeight: 800, color: '#14532D', fontSize: '0.98rem'}}>Executive Leaders</div>
                        <div style={{fontSize: '0.75rem', color: '#15803D'}}>ፈጻሚ ኣካል</div>
                      </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.65rem'}}>
                      {groupedByTerm[term].executive.map(leader => (
                        <div key={leader.id} style={{
                          background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #DCFCE7',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <div>
                            <div className="notranslate" translate="no" style={{fontWeight: 700, color: '#0F172A', fontSize: '0.95rem'}}>{leader.name}</div>
                            {leader.role_title && (
                              <div style={{fontSize: '0.8rem', color: '#1A6B3C', fontWeight: 600}}>{leader.role_title}</div>
                            )}
                            {(leader.phone || leader.email) && (
                              <div style={{fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem'}}>
                                {leader.phone} {leader.email && `• ${leader.email}`}
                              </div>
                            )}
                          </div>
                          <div style={{display: 'flex', gap: '0.35rem'}}>
                            <button
                              onClick={() => handleEditLeader(leader)}
                              style={{padding: '0.3rem 0.55rem', borderRadius: '4px', background: '#EBF0F7', color: '#1E3A5F', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'}}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteLeader(leader.id, leader.name)}
                              style={{padding: '0.3rem 0.55rem', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'}}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}

                      {groupedByTerm[term].executive.length === 0 && (
                        <div style={{fontSize: '0.85rem', color: '#94A3B8', padding: '1rem', textAlign: 'center'}}>
                          No executive leaders added for this term yet.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}

            {Object.keys(groupedByTerm).length === 0 && (
              <div style={{textAlign: 'center', padding: '3rem', background: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', color: '#94A3B8'}}>
                No leadership records found. Use the form on the left to add your first leader.
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MEETINGS PLANNING & MINUTES / REPORTS */}
      {/* ======================================================== */}
      {activeTab === 'meetings' && (
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(330px, 420px) 1fr', gap: '2rem', alignItems: 'start'}}>
          
          {/* Left Form: Plan Meeting / Record Minutes */}
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
            borderTop: editingMeetingId ? '5px solid #D4A843' : '5px solid #0284C7'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0}}>
                {editingMeetingId ? '✏️ Edit Meeting Report' : '📅 Plan / Record Meeting'}
              </h2>
              {editingMeetingId && (
                <button
                  type="button"
                  onClick={resetMeetingForm}
                  style={{background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline'}}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {meetingStatus.message && (
              <div style={{background: '#DCFCE7', color: '#15803D', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600}}>
                ✅ {meetingStatus.message}
              </div>
            )}

            {meetingStatus.error && (
              <div style={{background: '#FDE8E8', color: '#C23B22', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600}}>
                ⚠️ {meetingStatus.error}
              </div>
            )}

            <form onSubmit={handleMeetingSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              {/* Meeting Topic / Title */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Meeting Topic / Title <span style={{color: '#C23B22'}}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Topic meeting about how to work event planning?"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm({...meetingForm, title: e.target.value})}
                  style={{width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.9rem', outline: 'none'}}
                />
              </div>

              {/* Date & Starting / Ending Time */}
              <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.65rem'}}>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Meeting Date <span style={{color: '#C23B22'}}>*</span>
                  </label>
                  <input 
                    type="date"
                    required
                    value={meetingForm.meeting_date}
                    onChange={e => setMeetingForm({...meetingForm, meeting_date: e.target.value})}
                    style={{width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Start Time
                  </label>
                  <input 
                    type="text"
                    placeholder="12:00"
                    value={meetingForm.start_time}
                    onChange={e => setMeetingForm({...meetingForm, start_time: e.target.value})}
                    style={{width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem'}}>
                    End Time
                  </label>
                  <input 
                    type="text"
                    placeholder="13:00"
                    value={meetingForm.end_time}
                    onChange={e => setMeetingForm({...meetingForm, end_time: e.target.value})}
                    style={{width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', outline: 'none'}}
                  />
                </div>
              </div>

              {/* Meeting Type & Location */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Meeting Type
                  </label>
                  <select
                    value={meetingForm.meeting_type}
                    onChange={e => setMeetingForm({...meetingForm, meeting_type: e.target.value})}
                    style={{width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFF'}}
                  >
                    <option value="Leadership Meeting">Leadership Meeting (ናይ መሪሕነት ኣኼባ)</option>
                    <option value="Hall / Membership Meeting">Hall / Membership Meeting (ናይ ኣዳራሽ ኣኼባ)</option>
                    <option value="Parliament Meeting">Parliament Meeting (ናይ ባይቶ ኣኼባ)</option>
                    <option value="Executive Committee">Executive Committee (ናይ ፈጻሚ ኣኼባ)</option>
                  </select>
                </div>

                <div>
                  <label style={{display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '0.3rem'}}>
                    Status
                  </label>
                  <select
                    value={meetingForm.status}
                    onChange={e => setMeetingForm({...meetingForm, status: e.target.value})}
                    style={{width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem', background: '#FFF'}}
                  >
                    <option value="Scheduled">Scheduled (ዝተመደበ)</option>
                    <option value="Completed">Completed (ዝተኻየደ)</option>
                    <option value="Cancelled">Cancelled (ዝተሰረዘ)</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: '0.3rem'}}>
                  Location / Venue
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Community Hall or Online / Zoom"
                  value={meetingForm.location}
                  onChange={e => setMeetingForm({...meetingForm, location: e.target.value})}
                  style={{width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem'}}
                />
              </div>

              {/* Available People / Attendees */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Available People in the Meeting (Attendees)
                </label>
                <textarea 
                  rows="2"
                  placeholder="e.g. Sened Luul, Dawit Luu, Michael, etc."
                  value={meetingForm.attendees}
                  onChange={e => setMeetingForm({...meetingForm, attendees: e.target.value})}
                  style={{width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.85rem', resize: 'vertical'}}
                />
              </div>

              {/* Report of Meeting / Writing Issues */}
              <div>
                <label style={{display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem'}}>
                  Meeting Report & Issues Discussed (Minutes)
                </label>
                <textarea 
                  rows="4"
                  placeholder="Writing issues, resolutions, planning points, and actionable items discussed during the meeting..."
                  value={meetingForm.issues_discussed}
                  onChange={e => setMeetingForm({...meetingForm, issues_discussed: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', resize: 'vertical'}}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={meetingStatus.loading}
                style={{
                  padding: '0.75rem', borderRadius: '8px', border: 'none',
                  background: editingMeetingId ? '#D4A843' : '#0284C7', color: '#FFFFFF', fontWeight: 700,
                  fontSize: '0.95rem', cursor: meetingStatus.loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {meetingStatus.loading ? 'Saving...' : (editingMeetingId ? '💾 Update Meeting Record' : '📝 Save Meeting & Report')}
              </button>

            </form>
          </div>

          {/* Right Display: Meetings History & Reports */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            
            {/* Filter Bar */}
            <div style={{
              background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px',
              border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
            }}>
              <div style={{fontWeight: 700, color: '#111827', fontSize: '0.95rem'}}>
                📅 Recorded Meetings ({meetings.length})
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '0.85rem', color: '#6B7280'}}>Filter Type:</span>
                <select
                  value={meetingFilter}
                  onChange={e => setMeetingFilter(e.target.value)}
                  style={{padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', fontWeight: 600, background: '#FFF'}}
                >
                  <option value="all">All Meetings (ኩሉ ኣኼባታት)</option>
                  <option value="Leadership Meeting">Leadership Meeting</option>
                  <option value="Hall / Membership Meeting">Hall / Membership Meeting</option>
                  <option value="Parliament Meeting">Parliament Meeting</option>
                </select>
              </div>
            </div>

            {/* Meetings Cards */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {meetings.map(m => (
                <div key={m.id} style={{
                  background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0',
                  padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  {/* Card Header */}
                  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem'}}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem'}}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                          background: m.status === 'Completed' ? '#DCFCE7' : (m.status === 'Cancelled' ? '#FEE2E2' : '#E0F2FE'),
                          color: m.status === 'Completed' ? '#166534' : (m.status === 'Cancelled' ? '#991B1B' : '#0369A1')
                        }}>
                          {m.status}
                        </span>

                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                          background: '#F1F5F9', color: '#1E293B'
                        }}>
                          {m.meeting_type}
                        </span>
                      </div>

                      <h3 style={{fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0}}>
                        {m.title}
                      </h3>
                    </div>

                    <div style={{display: 'flex', gap: '0.35rem'}}>
                      <button
                        onClick={() => handleEditMeeting(m)}
                        style={{padding: '0.35rem 0.65rem', borderRadius: '6px', background: '#EBF0F7', color: '#1E3A5F', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'}}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(m.id, m.title)}
                        style={{padding: '0.35rem 0.65rem', borderRadius: '6px', background: '#FEE2E2', color: '#991B1B', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
                    padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem'
                  }}>
                    <div>📅 <strong>Date:</strong> {m.meeting_date}</div>
                    <div>⏰ <strong>Time:</strong> {m.start_time || '12:00'} - {m.end_time || '13:00'}</div>
                    <div>📍 <strong>Venue:</strong> {m.location || 'Community Hall'}</div>
                    {m.created_by && <div>👤 <strong>Recorded by:</strong> {m.created_by}</div>}
                  </div>

                  {/* Attendees */}
                  {m.attendees && (
                    <div style={{marginBottom: '0.75rem', fontSize: '0.85rem'}}>
                      <span style={{fontWeight: 700, color: '#334155'}}>👥 Available People (Attendees): </span>
                      <span className="notranslate" translate="no" style={{color: '#475569'}}>{m.attendees}</span>
                    </div>
                  )}

                  {/* Issues Discussed / Report */}
                  {m.issues_discussed && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.85rem', borderRadius: '8px', background: '#FAFAF8',
                      borderLeft: '4px solid #0284C7', fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.6
                    }}>
                      <div style={{fontWeight: 700, fontSize: '0.82rem', color: '#0369A1', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                        📝 Report / Issues Discussed
                      </div>
                      <div style={{whiteSpace: 'pre-wrap'}}>{m.issues_discussed}</div>
                    </div>
                  )}

                </div>
              ))}

              {meetings.length === 0 && (
                <div style={{textAlign: 'center', padding: '3rem', background: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', color: '#94A3B8'}}>
                  No meetings recorded yet. Use the form on the left to schedule or record a meeting.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
