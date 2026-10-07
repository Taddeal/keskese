import React, { useState, useEffect } from 'react';

export default function AdminFinances() {
  const [activeTab, setActiveTab] = useState('dues');
  
  // Dues Form State
  const [duesForm, setDuesForm] = useState({
    member_id: '',
    member_name: '',
    year: '2026',
    month: 'January',
    payment_type: 'Membership Dues',
    billed_amount: '100',
    paid_amount: '100',
    payment_date: new Date().toISOString().split('T')[0],
    payer_name: '',
    receipt_number: ''
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'Hall Rental',
    description: '',
    amount: '',
    vendor_name: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_reference: ''
  });

  // Dues List & Pagination
  const [duesData, setDuesData] = useState({ records: [], total_records: 0, total_pages: 1, current_page: 1 });
  const [duesPage, setDuesPage] = useState(1);
  const [duesSearch, setDuesSearch] = useState('');
  const [duesCategoryFilter, setDuesCategoryFilter] = useState('all');

  const [expenseData, setExpenseData] = useState({ total_expenses: '0.00', records: [] });
  const [status, setStatus] = useState({ loading: false, message: null, error: null });

  const adminUser = JSON.parse(sessionStorage.getItem('keskese_admin_user') || '{}');

  const baseUrl = window.location.origin.includes('localhost') 
    ? 'http://localhost/keskese/api' 
    : '/api';

  useEffect(() => {
    loadFinances();
  }, [activeTab, duesPage, duesCategoryFilter]);

  const loadFinances = async () => {
    setStatus({ loading: true, message: null, error: null });
    try {
      if (activeTab === 'dues') {
        const queryParams = new URLSearchParams({
          page: duesPage,
          limit: 10,
          search: duesSearch,
          payment_type: duesCategoryFilter
        });
        const res = await fetch(`${baseUrl}/dues.php?${queryParams.toString()}`);
        const json = await res.json();
        if (json.status === 'success') {
          setDuesData(json);
        } else if (Array.isArray(json)) {
          setDuesData({ records: json, total_records: json.length, total_pages: 1, current_page: 1 });
        }
      } else {
        const res = await fetch(`${baseUrl}/expenses.php`);
        const json = await res.json();
        if (json.status === 'success') setExpenseData(json);
      }
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setStatus({ loading: false, message: null, error: null });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDuesPage(1);
    loadFinances();
  };

  const handleDuesSubmit = async (e) => {
    e.preventDefault();
    if (!duesForm.member_id || !duesForm.member_name) {
      setStatus({ loading: false, message: null, error: 'Member ID and Member Name are required.' });
      return;
    }

    setStatus({ loading: true, message: null, error: null });
    try {
      const res = await fetch(`${baseUrl}/dues.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...duesForm,
          accepted_by: adminUser?.username || 'admin'
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setStatus({ loading: false, message: `Payment saved! Generated Receipt: ${json.receipt_number} (Accepted by: ${json.accepted_by || adminUser?.username || 'admin'})`, error: null });
        setDuesForm({
          member_id: '',
          member_name: '',
          year: '2026',
          month: 'January',
          payment_type: 'Membership Dues',
          billed_amount: '100',
          paid_amount: '100',
          payment_date: new Date().toISOString().split('T')[0],
          payer_name: '',
          receipt_number: ''
        });
        loadFinances();
      } else {
        setStatus({ loading: false, message: null, error: json.message || 'Failed to save payment.' });
      }
    } catch (err) {
      setStatus({ loading: false, message: null, error: err.message });
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) {
      setStatus({ loading: false, message: null, error: 'Description and Amount are required.' });
      return;
    }

    setStatus({ loading: true, message: null, error: null });
    try {
      const res = await fetch(`${baseUrl}/expenses.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      const json = await res.json();
      if (json.status === 'success') {
        setStatus({ loading: false, message: 'Expense record saved successfully!', error: null });
        setExpenseForm({
          category: 'Hall Rental',
          description: '',
          amount: '',
          vendor_name: '',
          expense_date: new Date().toISOString().split('T')[0],
          receipt_reference: ''
        });
        loadFinances();
      } else {
        setStatus({ loading: false, message: null, error: json.message || 'Failed to save expense.' });
      }
    } catch (err) {
      setStatus({ loading: false, message: null, error: err.message });
    }
  };

  return (
    <div className="container" style={{maxWidth: '1150px', padding: '2rem 1rem'}}>
      
      {/* Top Header */}
      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0}}>
          💳 Financial Management & Payment Tracker
        </h1>
        <p style={{color: '#6B7280', margin: '0.25rem 0 0', fontSize: '0.95rem'}}>
          Record member dues, event ticket payments, generate digital receipts, and track operating expenses.
        </p>
      </div>

      {/* Tabs Control */}
      <div style={{display: 'flex', gap: '1rem', borderBottom: '2px solid #E5E7EB', marginBottom: '2rem'}}>
        <button 
          onClick={() => setActiveTab('dues')}
          style={{
            padding: '0.75rem 1.5rem', background: 'none', border: 'none',
            borderBottom: activeTab === 'dues' ? '3px solid #1A6B3C' : '3px solid transparent',
            color: activeTab === 'dues' ? '#1A6B3C' : '#6B7280', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer'
          }}
        >
          👥 Member Dues & Event Payments
        </button>

        <button 
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '0.75rem 1.5rem', background: 'none', border: 'none',
            borderBottom: activeTab === 'expenses' ? '3px solid #1A6B3C' : '3px solid transparent',
            color: activeTab === 'expenses' ? '#1A6B3C' : '#6B7280', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer'
          }}
        >
          💸 Operating Expenses
        </button>
      </div>

      {status.message && (
        <div style={{background: '#DCFCE7', color: '#15803D', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #86EFAC'}}>
          ✅ {status.message}
        </div>
      )}

      {status.error && (
        <div style={{background: '#FDE8E8', color: '#C23B22', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #F8B4B4'}}>
          ⚠️ {status.error}
        </div>
      )}

      {/* TAB 1: Member Dues & Event Payments */}
      {activeTab === 'dues' && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
          
          {/* Add Dues/Payment Form */}
          <div style={{background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'}}>
            <h3 style={{margin: '0 0 1.25rem', fontSize: '1.2rem', color: '#1E3A5F', fontWeight: 700}}>
              ➕ Log Payment / Dues
            </h3>

            <form onSubmit={handleDuesSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem'}}>
              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Member ID *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 or KM-001" 
                  value={duesForm.member_id}
                  onChange={e => setDuesForm({...duesForm, member_id: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Member Name *</label>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={duesForm.member_name}
                  onChange={e => setDuesForm({...duesForm, member_name: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              {/* Payment Type / Category */}
              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Payment Category (ዓይነት ክፍሊ) *</label>
                <select 
                  value={duesForm.payment_type}
                  onChange={e => setDuesForm({...duesForm, payment_type: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF'}}
                >
                  <option value="Membership Dues">Membership Dues (ናይ ኣባልነት ክፍሊ)</option>
                  <option value="Sport Event">Sport Event (ናይ ስፖርት መደብ)</option>
                  <option value="Cultural Event">Cultural Event (ናይ ባህሊ መደብ)</option>
                  <option value="Launch Event">Launch Event (ናይ መእተዊ መደብ)</option>
                  <option value="General Donation">General Donation (ወፈያ)</option>
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                <div>
                  <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Year</label>
                  <select 
                    value={duesForm.year}
                    onChange={e => setDuesForm({...duesForm, year: e.target.value})}
                    style={{width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF'}}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                <div>
                  <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Month</label>
                  <select 
                    value={duesForm.month}
                    onChange={e => setDuesForm({...duesForm, month: e.target.value})}
                    style={{width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF'}}
                  >
                    <option value="Annual">Annual</option>
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
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                <div>
                  <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Billed (€)</label>
                  <input 
                    type="number" step="0.01"
                    value={duesForm.billed_amount}
                    onChange={e => setDuesForm({...duesForm, billed_amount: e.target.value})}
                    style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                  />
                </div>

                <div>
                  <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Paid (€)</label>
                  <input 
                    type="number" step="0.01"
                    value={duesForm.paid_amount}
                    onChange={e => setDuesForm({...duesForm, paid_amount: e.target.value})}
                    style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                  />
                </div>
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Payment Date</label>
                <input 
                  type="date" 
                  value={duesForm.payment_date}
                  onChange={e => setDuesForm({...duesForm, payment_date: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <button 
                type="submit"
                disabled={status.loading}
                style={{
                  padding: '0.85rem', background: '#1A6B3C', color: '#FFF',
                  border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
                  cursor: status.loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem'
                }}
              >
                {status.loading ? 'Saving...' : '💾 Save Payment Record'}
              </button>
            </form>
          </div>

          {/* Dues List & Search / Pagination Table */}
          <div style={{background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', overflowX: 'auto'}}>
            
            {/* Table Search & Category Filter Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem'}}>
              <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1E3A5F', fontWeight: 700}}>
                📜 Payment & Dues Records
              </h3>

              <form onSubmit={handleSearchSubmit} style={{display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px'}}>
                <input 
                  type="text"
                  placeholder="Search ID, name, receipt..."
                  value={duesSearch}
                  onChange={e => setDuesSearch(e.target.value)}
                  style={{flex: 1, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem'}}
                />
                <button type="submit" style={{padding: '0.45rem 0.85rem', background: '#0D9488', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'}}>
                  🔍
                </button>
              </form>
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem'}}>
              <thead>
                <tr style={{background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569'}}>
                  <th style={{padding: '0.6rem 0.75rem'}}>ID</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Name</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Category</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Month/Year</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Billed</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Paid</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Remaining</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Receipt #</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Accepted By (ስም ክፍሊት ፈጻሚ)</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {duesData.records && duesData.records.map((d, idx) => (
                  <tr key={d.id || idx} style={{borderBottom: '1px solid #F1F5F9'}}>
                    <td style={{padding: '0.65rem 0.75rem', fontWeight: 700}}>{d.member_id}</td>
                    <td style={{padding: '0.65rem 0.75rem'}}>{d.member_name}</td>
                    <td style={{padding: '0.65rem 0.75rem'}}>
                      <span style={{padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#F1F5F9', fontWeight: 600, color: '#1E3A5F', fontSize: '0.78rem'}}>
                        {d.payment_type || 'Membership Dues'}
                      </span>
                    </td>
                    <td style={{padding: '0.65rem 0.75rem'}}>{d.month} {d.year}</td>
                    <td style={{padding: '0.65rem 0.75rem'}}>€{d.billed_amount}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#0D9488', fontWeight: 700}}>€{d.paid_amount}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#D97706', fontWeight: 700}}>€{d.remaining_amount}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#2563EB', fontWeight: 600}}>{d.receipt_number}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#475569', fontWeight: 600}}>
                      {d.accepted_by ? `👤 ${d.accepted_by}` : '—'}
                    </td>
                    <td style={{padding: '0.65rem 0.75rem'}}>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                        background: d.status === 'Paid' ? '#DCFCE7' : (d.status === 'Partial' ? '#FEF3C7' : '#FEE2E2'),
                        color: d.status === 'Paid' ? '#166534' : (d.status === 'Partial' ? '#92400E' : '#991B1B')
                      }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB', fontSize: '0.85rem'}}>
              <div style={{color: '#6B7280'}}>
                Showing Page {duesData.current_page || 1} of {duesData.total_pages || 1} ({duesData.total_records || 0} total records)
              </div>
              
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button 
                  disabled={duesPage <= 1}
                  onClick={() => setDuesPage(duesPage - 1)}
                  style={{padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', background: duesPage <= 1 ? '#F3F4F6' : '#FFF', cursor: duesPage <= 1 ? 'not-allowed' : 'pointer'}}
                >
                  ◀ Previous
                </button>
                <button 
                  disabled={duesPage >= (duesData.total_pages || 1)}
                  onClick={() => setDuesPage(duesPage + 1)}
                  style={{padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', background: duesPage >= (duesData.total_pages || 1) ? '#F3F4F6' : '#FFF', cursor: duesPage >= (duesData.total_pages || 1) ? 'not-allowed' : 'pointer'}}
                >
                  Next ▶
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Operating Expenses */}
      {activeTab === 'expenses' && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
          
          {/* Add Expense Form */}
          <div style={{background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'}}>
            <h3 style={{margin: '0 0 1.25rem', fontSize: '1.2rem', color: '#1E3A5F', fontWeight: 700}}>
              ➕ Log Outflow / Expense
            </h3>

            <form onSubmit={handleExpenseSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem'}}>
              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Category</label>
                <select 
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFF'}}
                >
                  <option value="Hall Rental">Hall Rental (ዛል / ቦክስ)</option>
                  <option value="Food & Catering">Food & Refreshments</option>
                  <option value="Event Equipment">Sound & Equipment</option>
                  <option value="Administrative">Administrative & Govt Registry</option>
                  <option value="Printing & Supplies">Printing & Supplies</option>
                  <option value="General">General / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Description *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hall rental for Launch Event" 
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Amount (€) *</label>
                <input 
                  type="number" step="0.01"
                  placeholder="e.g. 250.00"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Vendor / Payee Name</label>
                <input 
                  type="text" 
                  placeholder="Company or Person name" 
                  value={expenseForm.vendor_name}
                  onChange={e => setExpenseForm({...expenseForm, vendor_name: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <div>
                <label style={{fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem'}}>Date</label>
                <input 
                  type="date" 
                  value={expenseForm.expense_date}
                  onChange={e => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                  style={{width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB'}}
                />
              </div>

              <button 
                type="submit"
                disabled={status.loading}
                style={{
                  padding: '0.85rem', background: '#C23B22', color: '#FFF',
                  border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
                  cursor: status.loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem'
                }}
              >
                {status.loading ? 'Saving...' : '💸 Save Expense'}
              </button>
            </form>
          </div>

          {/* Expenses List & Summary */}
          <div style={{background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem'}}>
              <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1E3A5F', fontWeight: 700}}>
                📜 Recorded Outflows
              </h3>
              <div style={{background: '#FEE2E2', color: '#991B1B', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem'}}>
                Total Outflow: € {expenseData.total_expenses}
              </div>
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem'}}>
              <thead>
                <tr style={{background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569'}}>
                  <th style={{padding: '0.6rem 0.75rem'}}>Category</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Description</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Amount</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Vendor</th>
                  <th style={{padding: '0.6rem 0.75rem'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.records && expenseData.records.map((e, idx) => (
                  <tr key={e.id || idx} style={{borderBottom: '1px solid #F1F5F9'}}>
                    <td style={{padding: '0.65rem 0.75rem', fontWeight: 600, color: '#1E3A5F'}}>{e.category}</td>
                    <td style={{padding: '0.65rem 0.75rem'}}>{e.description}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#C23B22', fontWeight: 700}}>€ {e.amount}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#475569'}}>{e.vendor_name || '-'}</td>
                    <td style={{padding: '0.65rem 0.75rem', color: '#64748B'}}>{e.expense_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
