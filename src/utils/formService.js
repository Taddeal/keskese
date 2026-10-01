import { addMember, getGoogleScriptUrl } from './storage';

export const submitForm = async (data, formType = 'Membership') => {
  const web3ApiKey = import.meta.env.VITE_WEB3FORMS_KEY || 'b9480a92-2b3d-44a6-a665-4d197d9f88b1';
  const googleScriptUrl = getGoogleScriptUrl();
  let assignedMemberId = null;

  // 1. Submit directly to MySQL Database via PHP API
  try {
    const baseUrl = window.location.origin.includes('localhost') 
      ? 'http://localhost/keskese/api' 
      : '/api';

    const dbPayload = {
      formType: formType || 'Membership',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      originVillage: data.originVillage || '',
      address: data.address || '',
      message: data.message || data.subject || ''
    };

    const res = await fetch(`${baseUrl}/submit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dbPayload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (json.status === 'success' && json.member_id) {
        assignedMemberId = json.member_id;
      }
    }
  } catch (dbErr) {
    console.warn('MySQL API submission error, proceeding with cache & fallback notifications:', dbErr);
  }

  // 2. Save locally for instant offline admin panel visibility
  try {
    if (formType === 'Membership' || formType === 'Contact') {
      addMember({
        memberId: assignedMemberId,
        formType: formType || 'Membership',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        originVillage: data.originVillage || '',
        address: data.address || '',
        message: data.message || data.subject || '',
        dateJoined: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Local storage backup error:', err);
  }

  // 3. Submit to Google Sheets via Google Apps Script Webhook (Non-blocking background fire)
  if (googleScriptUrl) {
    const payload = {
      memberId: assignedMemberId || '',
      formType: formType || 'Membership',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      originVillage: data.originVillage || '',
      address: data.address || '',
      message: data.message || data.subject || '',
      timestamp: new Date().toLocaleDateString()
    };

    const queryParams = new URLSearchParams(payload).toString();
    const targetUrl = `${googleScriptUrl}${googleScriptUrl.includes('?') ? '&' : '?'}${queryParams}`;

    fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload)
    }).catch(err => console.error('Google Sheets submission background error:', err));
  }

  // 4. Submit to Web3Forms for Email Notification (Non-blocking background fire)
  if (web3ApiKey) {
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: web3ApiKey,
        subject: `New ${formType} Submission (${assignedMemberId || 'New Member'}) - Keskese Milash`,
        ...data,
        member_id: assignedMemberId || 'Pending'
      })
    }).then(res => res.json())
      .catch(err => console.error('Web3Forms email background error:', err));
  }

  return { 
    success: true, 
    message: 'Submitted successfully!', 
    member_id: assignedMemberId 
  };
};
