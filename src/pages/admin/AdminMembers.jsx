import React, { useState, useEffect } from 'react';
import { getMembers, fetchMembersRemote, deleteMember } from '../../utils/storage';

const parseDate = (dStr) => {
  if (!dStr) return 0;
  const d = new Date(dStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const safeFormatDate = (dStr) => {
  if (!dStr) return 'N/A';
  const d = new Date(dStr);
  return isNaN(d.getTime()) ? String(dStr) : d.toLocaleDateString();
};

export default function AdminMembers() {
  // 1. Initialize immediately with cached members (0ms latency)
  const [members, setMembers] = useState(() => {
    const cached = getMembers();
    return cached.sort((a, b) => parseDate(b.dateJoined) - parseDate(a.dateJoined));
  });
  const [loading, setLoading] = useState(members.length === 0);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadMembers = async () => {
    if (members.length === 0) {
      setLoading(true);
    } else {
      setSyncing(true);
    }

    const allMembers = await fetchMembersRemote();
    const sorted = Array.isArray(allMembers)
      ? [...allMembers].sort((a, b) => parseDate(b.dateJoined) - parseDate(a.dateJoined))
      : [];
    setMembers(sorted);
    setLoading(false);
    setSyncing(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this member registration? This action cannot be undone.')) {
      deleteMember(id);
      setFeedback('Member record deleted.');
      setTimeout(() => setFeedback(null), 3000);
      loadMembers();
      if (selectedMember?.id === id) setSelectedMember(null);
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Date Joined', 'Message'];
    const rows = members.map(m => [
      `"${String(m.name || '').replace(/"/g, '""')}"`,
      `"${String(m.email || '').replace(/"/g, '""')}"`,
      `"${String(m.phone || '').replace(/"/g, '""')}"`,
      `"${safeFormatDate(m.dateJoined || Date.now())}"`,
      `"${String(m.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `keskese_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredMembers = members.filter(m => {
    const query = searchQuery.toLowerCase();
    const nameStr = String(m.name || '').toLowerCase();
    const emailStr = String(m.email || '').toLowerCase();
    const phoneStr = String(m.phone || '').toLowerCase();
    return nameStr.includes(query) || emailStr.includes(query) || phoneStr.includes(query);
  });

  return (
    <div className="container" style={{maxWidth: '1150px'}}>
      
      {/* Top Header & Action Controls */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem'}}>
            <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0}}>
              👥 Membership Directory ({filteredMembers.length})
            </h1>
            {syncing && (
              <span style={{
                fontSize: '0.8rem', background: '#EBF0F7', color: '#1E3A5F',
                padding: '0.25rem 0.75rem', borderRadius: '50px', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}>
                🔄 Syncing Google Sheets...
              </span>
            )}
          </div>
          <p style={{color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.95rem'}}>
            Manage submitted applications and export member records to CSV format.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          disabled={members.length === 0}
          style={{
            background: members.length === 0 ? '#E5E7EB' : '#1A6B3C',
            color: members.length === 0 ? '#9CA3AF' : '#FFFFFF',
            padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 700,
            fontSize: '0.92rem', border: 'none', cursor: members.length === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: members.length === 0 ? 'none' : '0 4px 12px rgba(26,107,60,0.25)'
          }}
        >
          <span>⬇️</span> Export CSV Spreadsheet
        </button>
      </div>

      {feedback && (
        <div style={{
          background: '#FDE8E8', color: '#C23B22', padding: '0.85rem 1.25rem',
          borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #F8B4B4'
        }}>
          ⚠️ {feedback}
        </div>
      )}

      {/* Filter / Search Control Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{fontSize: '1.2rem', color: '#9CA3AF'}}>🔍</div>
        <input 
          type="text"
          placeholder="Filter by name, email address, or phone number..."
          style={{
            width: '100%', border: 'none', fontSize: '0.95rem', outline: 'none',
            color: '#1F2937'
          }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontWeight: 700}}
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Members Table Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB', overflow: 'hidden'
      }}>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem'}}>
            <thead>
              <tr style={{background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#374151'}}>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Full Name</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Email</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Phone</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Date Submitted</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Message / Notes</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '4rem 1rem', color: '#1E3A5F'}}>
                    <div style={{fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'spin 1.5s linear infinite'}}>⌛</div>
                    <div style={{fontSize: '1.1rem', fontWeight: 700, color: '#1E3A5F'}}>Fetching members live from Google Sheets...</div>
                    <p style={{color: '#6B7280', fontSize: '0.88rem', margin: '0.3rem 0 0'}}>Connecting to Google Apps Script endpoint</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id || idx} style={{
                    borderBottom: '1px solid #F3F4F6',
                    background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                    transition: 'background 0.15s ease'
                  }}>
                    <td style={{padding: '1rem 1.25rem', fontWeight: 700, color: '#1A1A2E'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5EE',
                          color: '#1A6B3C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {m.name ? String(m.name).charAt(0).toUpperCase() : '👤'}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>

                    <td style={{padding: '1rem 1.25rem'}}>
                      <a href={`mailto:${m.email}`} style={{color: '#1A6B3C', textDecoration: 'none', fontWeight: 600}}>
                        {m.email}
                      </a>
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#4B5563'}}>
                      <a href={`tel:${m.phone}`} style={{color: '#374151', textDecoration: 'none'}}>
                        {m.phone}
                      </a>
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#6B7280', fontSize: '0.85rem'}}>
                      📅 {safeFormatDate(m.dateJoined)}
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#6B7280', maxWidth: '240px'}}>
                      {m.message ? (
                        <button 
                          onClick={() => setSelectedMember(m)}
                          style={{
                            background: '#EBF0F7', color: '#1E3A5F', border: 'none',
                            padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                          }}
                        >
                          💬 Read Note
                        </button>
                      ) : (
                        <span style={{color: '#D1D5DB', fontSize: '0.82rem', italic: 'true'}}>No message</span>
                      )}
                    </td>

                    <td style={{padding: '1rem 1.25rem', textAlign: 'right'}}>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        style={{
                          background: '#FDE8E8', color: '#C23B22', border: 'none',
                          padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: 600
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '3.5rem 1rem', color: '#9CA3AF'}}>
                    <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>📂</div>
                    <p style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>No member submissions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal / Drawer */}
      {selectedMember && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', padding: '2rem',
            maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid #F3F4F6', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0, fontSize: '1.25rem', color: '#1A1A2E', fontWeight: 700}}>
                Member Application Details
              </h3>
              <button 
                onClick={() => setSelectedMember(null)}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF'}}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', marginBottom: '1.5rem'}}>
              <div>
                <strong>Name:</strong> {selectedMember.name}
              </div>
              <div>
                <strong>Email:</strong> <a href={`mailto:${selectedMember.email}`} style={{color: '#1A6B3C'}}>{selectedMember.email}</a>
              </div>
              <div>
                <strong>Phone:</strong> {selectedMember.phone}
              </div>
              <div>
                <strong>Date Registered:</strong> {new Date(selectedMember.dateJoined).toLocaleString()}
              </div>
              <div style={{background: '#FAFAF8', padding: '1rem', borderRadius: '10px', border: '1px solid #E5E7EB'}}>
                <strong style={{display: 'block', marginBottom: '0.4rem', color: '#374151'}}>Applicant Note / Message:</strong>
                <p style={{margin: 0, color: '#4B5563', lineHeight: 1.6, whitespace: 'pre-wrap'}}>
                  {selectedMember.message || 'No additional message provided.'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMember(null)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '10px',
                background: '#1A6B3C', color: '#FFF', fontWeight: 700,
                border: 'none', cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
