import { addMember } from './storage';

export const submitForm = async (data, formType) => {
  const web3ApiKey = import.meta.env.VITE_WEB3FORMS_KEY || 'b9480a92-2b3d-44a6-a665-4d197d9f88b1';
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby6UF14quFcku_Wp8FTJboAG10-Mskmdl1fs6Jdiozn8Y7k_xGHGP5mR1ITlmO4GseyLA/exec';

  // 0. Save locally for instant admin panel visibility
  try {
    if (formType === 'Membership' || formType === 'Contact') {
      addMember({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        message: data.message || data.subject || '',
        dateJoined: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Local storage backup error:', err);
  }

  // 1. Submit to Google Sheets via Google Apps Script Webhook (Non-blocking background fire)
  if (googleScriptUrl) {
    const payload = {
      formType: formType || 'Membership',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
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

  // 2. Submit to Web3Forms for Email Notification (Non-blocking background fire)
  if (web3ApiKey) {
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: web3ApiKey,
        subject: `New ${formType} Submission - Keskese Milash`,
        ...data
      })
    }).then(res => res.json())
      .catch(err => console.error('Web3Forms email background error:', err));
  }

  // Return immediate success for instantaneous UI feedback (< 100ms)
  return { success: true, message: 'Submitted successfully!' };
};
