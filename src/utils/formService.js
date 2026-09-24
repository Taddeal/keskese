export const submitForm = async (data, formType) => {
  const web3ApiKey = import.meta.env.VITE_WEB3FORMS_KEY;
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyQmang9Kkq9Rj0hvNv94_ptejo0NJ0Mov4lcJor6bge5pSu46ArIawLCyPZCxoubY1eA/exec';

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
