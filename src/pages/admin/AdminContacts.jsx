import React, { useState, useEffect } from 'react';

const safeFormatDate = (dStr) => {
  if (!dStr) return 'N/A';
  const d = new Date(dStr);
  return isNaN(d.getTime()) ? String(dStr) : d.toLocaleDateString();
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total_records: 0, total_pages: 1 });
  const [selectedContact, setSelectedContact] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const baseUrl = window.location.origin.includes('localhost')
    ? 'http://localhost/keskese/api'
    : '/api';

  const loadContacts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search: searchQuery
      }).toString();

      const res = await fetch(`${baseUrl}/contacts.php?${queryParams}`);
      const json = await res.json();

      if (json.status === 'success') {
        setContacts(json.records || []);
        setPaginationInfo({
          total_records: json.total_records || (json.records ? json.records.length : 0),
          total_pages: json.total_pages || 1
        });
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.warn('Failed to load contact messages:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [page, searchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      setContacts(prev => prev.filter(c => c.id !== id));
      try {
        await fetch(`${baseUrl}/contacts.php?action=delete&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
      } catch (err) {
        console.error('Failed to delete contact from database:', err);
      }
      setFeedback('Contact message deleted.');
      setTimeout(() => setFeedback(null), 3000);
      loadContacts();
      if (selectedContact?.id === id) setSelectedContact(null);
    }
  };

  const handleExportCSV = () => {
    if (contacts.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Date Submitted', 'Message'];
    const rows = contacts.map(c => [
      `"${String(c.name || '').replace(/"/g, '""')}"`,
      `"${String(c.email || '').replace(/"/g, '""')}"`,
      `"${String(c.phone || '').replace(/"/g, '""')}"`,
      `"${String(c.subject || '').replace(/"/g, '""')}"`,
      `"${safeFormatDate(c.dateSubmitted)}"`,
      `"${String(c.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `keskese_contact_inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredContacts = contacts.filter(c => {
    const query = searchQuery.toLowerCase();
    const nameStr = String(c.name || '').toLowerCase();
    const emailStr = String(c.email || '').toLowerCase();
    const phoneStr = String(c.phone || '').toLowerCase();
    const subjectStr = String(c.subject || '').toLowerCase();
    const messageStr = String(c.message || '').toLowerCase();
    return nameStr.includes(query) || emailStr.includes(query) || phoneStr.includes(query) || subjectStr.includes(query) || messageStr.includes(query);
  });

  return (
    <div className="container" style={{maxWidth: '1200px'}}>
      
      {/* Top Header & Actions */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0}}>
            📩 Contact Us Inquiries ({paginationInfo.total_records || filteredContacts.length})
          </h1>
          <p style={{color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.95rem'}}>
            View and manage questions and community inquiries sent via the Contact Us form.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          disabled={contacts.length === 0}
          style={{
            background: contacts.length === 0 ? '#E5E7EB' : '#1A6B3C',
            color: contacts.length === 0 ? '#9CA3AF' : '#FFFFFF',
            padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 700,
            fontSize: '0.92rem', border: 'none', cursor: contacts.length === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: contacts.length === 0 ? 'none' : '0 4px 12px rgba(26,107,60,0.25)'
          }}
        >
          <span>⬇️</span> Export CSV
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

      {/* Filter / Search Bar */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{fontSize: '1.2rem', color: '#9CA3AF'}}>🔍</div>
        <input 
          type="text"
          placeholder="Filter by name, email, subject, or message content..."
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

      {/* Messages Table */}
      <div style={{
        background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB', overflow: 'hidden'
      }}>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem'}}>
            <thead>
              <tr style={{background: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#374151'}}>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Sender Name</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Email</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Phone</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Subject / Topic</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Date Submitted</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700}}>Message</th>
                <th style={{padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '4rem 1rem', color: '#1E3A5F'}}>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⌛</div>
                    <div style={{fontSize: '1rem', fontWeight: 700}}>Loading contact inquiries...</div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c, idx) => (
                  <tr key={c.id || idx} style={{
                    borderBottom: '1px solid #F3F4F6',
                    background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                    transition: 'background 0.15s ease'
                  }}>
                    <td style={{padding: '1rem 1.25rem', fontWeight: 700, color: '#1A1A2E'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: '#E0F2FE',
                          color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {c.name ? String(c.name).charAt(0).toUpperCase() : '📩'}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    <td style={{padding: '1rem 1.25rem'}}>
                      <a href={`mailto:${c.email}`} style={{color: '#0369A1', textDecoration: 'none', fontWeight: 600}}>
                        {c.email}
                      </a>
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#4B5563'}}>
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} style={{color: '#374151', textDecoration: 'none'}}>
                          {c.phone}
                        </a>
                      ) : (
                        <span style={{color: '#9CA3AF'}}>-</span>
                      )}
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#1F2937', fontWeight: 600}}>
                      {c.subject || 'General Inquiry'}
                    </td>

                    <td style={{padding: '1rem 1.25rem', color: '#6B7280', fontSize: '0.85rem'}}>
                      📅 {safeFormatDate(c.dateSubmitted)}
                    </td>

                    <td style={{padding: '1rem 1.25rem', maxWidth: '280px'}}>
                      <button 
                        onClick={() => setSelectedContact(c)}
                        style={{
                          background: '#EBF0F7', color: '#1E3A5F', border: 'none',
                          padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                        }}
                      >
                        💬 Read Message
                      </button>
                    </td>

                    <td style={{padding: '1rem 1.25rem', textAlign: 'right'}}>
                      <button 
                        onClick={() => handleDelete(c.id)}
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

              {!loading && filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '3.5rem 1rem', color: '#9CA3AF'}}>
                    <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>📭</div>
                    <p style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>No contact messages found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E5E7EB', fontSize: '0.88rem'}}>
          <div style={{color: '#6B7280', fontWeight: 600}}>
            Showing Page {page} of {paginationInfo.total_pages || 1} ({paginationInfo.total_records || contacts.length} total messages)
          </div>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #D1D5DB', background: page <= 1 ? '#F3F4F6' : '#FFF', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600}}
            >
              ◀ Previous
            </button>
            <button 
              disabled={page >= (paginationInfo.total_pages || 1)}
              onClick={() => setPage(page + 1)}
              style={{padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #D1D5DB', background: page >= (paginationInfo.total_pages || 1) ? '#F3F4F6' : '#FFF', cursor: page >= (paginationInfo.total_pages || 1) ? 'not-allowed' : 'pointer', fontWeight: 600}}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Message Modal Drawer */}
      {selectedContact && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', padding: '2rem',
            maxWidth: '550px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid #F3F4F6', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0, fontSize: '1.25rem', color: '#1A1A2E', fontWeight: 700}}>
                Inquiry Details
              </h3>
              <button 
                onClick={() => setSelectedContact(null)}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF'}}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', marginBottom: '1.5rem'}}>
              <div>
                <strong>Sender Name:</strong> {selectedContact.name}
              </div>
              <div>
                <strong>Email:</strong> <a href={`mailto:${selectedContact.email}`} style={{color: '#0369A1'}}>{selectedContact.email}</a>
              </div>
              <div>
                <strong>Phone:</strong> {selectedContact.phone || 'N/A'}
              </div>
              <div>
                <strong>Subject:</strong> {selectedContact.subject || 'General Inquiry'}
              </div>
              <div>
                <strong>Date Sent:</strong> {safeFormatDate(selectedContact.dateSubmitted)}
              </div>
              <div style={{background: '#FAFAF8', padding: '1rem', borderRadius: '10px', border: '1px solid #E5E7EB', marginTop: '0.5rem'}}>
                <strong style={{display: 'block', marginBottom: '0.4rem', color: '#374151'}}>Full Message:</strong>
                <p style={{margin: 0, color: '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap'}}>
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <a 
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || 'Keskese Milash Inquiry')}`}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px',
                  background: '#0369A1', color: '#FFF', fontWeight: 700,
                  textAlign: 'center', textDecoration: 'none', fontSize: '0.92rem'
                }}
              >
                ✉️ Reply via Email
              </a>
              <button 
                onClick={() => setSelectedContact(null)}
                style={{
                  padding: '0.75rem 1.25rem', borderRadius: '10px',
                  background: '#F3F4F6', color: '#374151', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontSize: '0.92rem'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
