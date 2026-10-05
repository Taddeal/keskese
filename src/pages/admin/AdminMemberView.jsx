import React, { useState, useEffect } from 'react';

export default function AdminMemberView() {
  const [memberId, setMemberId] = useState('1');
  const [year, setYear] = useState('2026');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [data, setData] = useState({
    status: 'idle',
    totals: { billed: '0.00', paid: '0.00', remaining: '0.00' },
    records: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch(new Event('submit'));
  }, []);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!memberId.trim()) return;

    setLoading(true);

    try {
      const baseUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost/keskese/api' 
        : '/api';
      
      const response = await fetch(`${baseUrl}/dues.php?member_id=${encodeURIComponent(memberId.trim())}&year=${year}`);
      const json = await response.json();

      if (json.status === 'success') {
        setData({
          status: 'success',
          totals: json.totals || { billed: '0.00', paid: '0.00', remaining: '0.00' },
          records: Array.isArray(json.records) ? json.records : []
        });
      } else {
        setData({
          status: 'error',
          totals: { billed: '0.00', paid: '0.00', remaining: '0.00' },
          records: []
        });
      }
    } catch (err) {
      console.error('Failed to fetch member dues statement:', err);
      setData({
        status: 'error',
        totals: { billed: '0.00', paid: '0.00', remaining: '0.00' },
        records: []
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = data.records.filter(r => {
    if (monthFilter !== 'all' && r.month !== monthFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.payment_type !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="container" style={{maxWidth: '1100px', padding: '2rem 1rem'}}>
      <div style={{background: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'}}>
        
        {/* Page Title & Admin Secured Note */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#1E3A5F', margin: 0}}>
              ርእይቶ ኣባል
            </h1>
            <span style={{background: '#E8F5EE', color: '#1A6B3C', padding: '0.25rem 0.75rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem'}}>
              🔒 Admin Member View
            </span>
          </div>
          <p style={{color: '#6B7280', margin: '0.4rem 0 0', fontSize: '0.95rem'}}>
            Look up member dues, event payments, and financial statements by Member ID and Year.
          </p>
        </div>

        {/* Search Controls Form */}
        <form onSubmit={handleSearch} style={{marginBottom: '1.5rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1rem', marginBottom: '1rem'}}>
            <div>
              <label style={{display: 'block', fontWeight: 700, color: '#1E3A5F', marginBottom: '0.4rem', fontSize: '0.95rem'}}>
                Member ID (መላለዪ ቁጽሪ)
              </label>
              <input 
                type="text"
                className="form-input"
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                placeholder="Enter Member ID (e.g. 1 or KM-001)"
                style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '1rem', outline: 'none'}}
              />
            </div>

            <div>
              <label style={{display: 'block', fontWeight: 700, color: '#1E3A5F', marginBottom: '0.4rem', fontSize: '0.95rem'}}>
                ዓመታዊ መዝገብ (Year)
              </label>
              <select 
                value={year}
                onChange={e => setYear(e.target.value)}
                style={{width: '100%', padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '1rem', outline: 'none', background: '#FFF'}}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', background: '#0D9488', color: '#FFFFFF',
              border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1.05rem',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(13,148,136,0.3)', transition: 'all 0.2s ease'
            }}
          >
            {loading ? '⌛ ይጽዕን ኣሎ...' : '🔍 View records'}
          </button>
        </form>

        {/* 3 Summary Stat Cards (Matching Canva Design Colors) */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem'}}>
          
          {/* Requested/Billed Amount Card (Dark Blue) */}
          <div style={{background: '#1E293B', color: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '0.95rem', fontWeight: 600, opacity: 0.85, marginBottom: '0.5rem'}}>
              ዝተጠልበ Amount
            </div>
            <div style={{fontSize: '2rem', fontWeight: 800}}>
              € {data.totals.billed}
            </div>
          </div>

          {/* Paid Amount Card (Teal) */}
          <div style={{background: '#0D9488', color: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '0.95rem', fontWeight: 600, opacity: 0.85, marginBottom: '0.5rem'}}>
              ዝተኸፍለ Amount
            </div>
            <div style={{fontSize: '2rem', fontWeight: 800}}>
              € {data.totals.paid}
            </div>
          </div>

          {/* Remaining Balance Card (Yellow/Gold) */}
          <div style={{background: '#F59E0B', color: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize: '0.95rem', fontWeight: 600, opacity: 0.85, marginBottom: '0.5rem'}}>
              ዝተረፈ Amount
            </div>
            <div style={{fontSize: '2rem', fontWeight: 800}}>
              € {data.totals.remaining}
            </div>
          </div>

        </div>

        {/* Filter Dropdowns */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap'}}>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            style={{padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF', fontSize: '0.9rem', fontWeight: 600}}
          >
            <option value="all">All payment categories (ኩሉ ዓይነታት ክፍሊ) ˅</option>
            <option value="Membership Dues">Membership Dues (ናይ ኣባልነት ክፍሊ)</option>
            <option value="Sport Event">Sport Event (ናይ ስፖርት መደብ)</option>
            <option value="Cultural Event">Cultural Event (ናይ ባህሊ መደብ)</option>
            <option value="Launch Event">Launch Event (ናይ መእተዊ መደብ)</option>
            <option value="General Donation">General Donation (ወፈያ)</option>
          </select>

          <select 
            value={monthFilter} 
            onChange={e => setMonthFilter(e.target.value)}
            style={{padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF', fontSize: '0.9rem', fontWeight: 600}}
          >
            <option value="all">All months ˅</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF', fontSize: '0.9rem', fontWeight: 600}}
          >
            <option value="all">All statuses ˅</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Financial Table */}
        <div style={{overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5E7EB'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem'}}>
            <thead>
              <tr style={{background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#1E293B', fontWeight: 800}}>
                <th style={{padding: '0.85rem 1rem'}}>ሽም</th>
                <th style={{padding: '0.85rem 1rem'}}>መላለዪ</th>
                <th style={{padding: '0.85rem 1rem'}}>ዓይነት ክፍሊ</th>
                <th style={{padding: '0.85rem 1rem'}}>ወርሒ</th>
                <th style={{padding: '0.85rem 1rem'}}>ዝተጠልበ</th>
                <th style={{padding: '0.85rem 1rem'}}>ዝተኸፍለ</th>
                <th style={{padding: '0.85rem 1rem'}}>ዝተረፈ</th>
                <th style={{padding: '0.85rem 1rem'}}>Date</th>
                <th style={{padding: '0.85rem 1rem'}}>ደረሰኝ</th>
                <th style={{padding: '0.85rem 1rem'}}>Accepted By</th>
                <th style={{padding: '0.85rem 1rem'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id || idx} style={{borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8'}}>
                    <td style={{padding: '0.85rem 1rem', fontWeight: 700, color: '#0F172A'}}>{r.member_name || 'Member'}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#475569'}}>{r.member_id}</td>
                    <td style={{padding: '0.85rem 1rem', fontWeight: 600, color: '#1E3A5F'}}>
                      <span style={{padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#F1F5F9', fontSize: '0.8rem'}}>
                        {r.payment_type || 'Membership Dues'}
                      </span>
                    </td>
                    <td style={{padding: '0.85rem 1rem', color: '#475569'}}>{r.month}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#1E293B', fontWeight: 600}}>€ {r.billed_amount}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#0D9488', fontWeight: 700}}>€ {r.paid_amount}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#D97706', fontWeight: 700}}>€ {r.remaining_amount}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#64748B'}}>{r.payment_date || '-'}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#2563EB', fontWeight: 600}}>{r.receipt_number || '-'}</td>
                    <td style={{padding: '0.85rem 1rem', color: '#475569', fontWeight: 600}}>
                      {r.accepted_by ? `👤 ${r.accepted_by}` : '—'}
                    </td>
                    <td style={{padding: '0.85rem 1rem'}}>
                      <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700,
                        background: r.status === 'Paid' ? '#DCFCE7' : (r.status === 'Partial' ? '#FEF3C7' : '#FEE2E2'),
                        color: r.status === 'Paid' ? '#166534' : (r.status === 'Partial' ? '#92400E' : '#991B1B')
                      }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8'}}>
                    ንዚ መላለዪ ቁጽሪ ኣብዚ ዓመት ዝተረኽበ መዝገብ የለን።
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
