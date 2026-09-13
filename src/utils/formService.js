export const submitForm = async (data, formType) => {
  const web3ApiKey = import.meta.env.VITE_WEB3FORMS_KEY;
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyQmang9Kkq9Rj0hvNv94_ptejo0NJ0Mov4lcJor6bge5pSu46ArIawLCyPZCxoubY1eA/exec';

  // 1. Submit to Google Sheets via Google Apps Script Webhook (Non-blocking background fire)
  if (googleScriptUrl) {
    const params = new URLSearchParams();
    params.append('formType', formType || 'Membership');
    params.append('name', data.name || '');
    params.append('email', data.email || '');
    params.append('phone', data.phone || '');
    params.append('message', data.message || data.subject || '');
    params.append('timestamp', new Date().toLocaleDateString());

    fetch(googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
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
