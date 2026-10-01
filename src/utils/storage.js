import initialNews from '../data/news.json';

// =========================================================================
// CONFIGURATION TOGGLE:
// Set ENABLE_DYNAMIC_NEWS to false (default) to display static Canva news.
// Set ENABLE_DYNAMIC_NEWS to true to reactivate dynamic Google Sheets fetching.
// =========================================================================
export const ENABLE_DYNAMIC_NEWS = false;

const getApiUrl = (endpoint) => {
  const isLocal = window.location.origin.includes('localhost');
  return isLocal ? `http://localhost/keskese/api/${endpoint}` : `/api/${endpoint}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const ACTIVE_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6UF14quFcku_Wp8FTJboAG10-Mskmdl1fs6Jdiozn8Y7k_xGHGP5mR1ITlmO4GseyLA/exec';

export const getGoogleScriptUrl = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0 && !envUrl.includes('AKfycbyQmang')) {
    return envUrl.trim();
  }
  return ACTIVE_GOOGLE_SCRIPT_URL;
};

export const getNews = () => {
  const cachedDb = localStorage.getItem('keskese_news_db');
  let dbPosts = [];
  if (cachedDb) {
    try {
      dbPosts = JSON.parse(cachedDb);
    } catch (e) {}
  }
  // Merge static 2 initial events with cached database posts
  const combined = [...initialNews, ...dbPosts];
  return combined.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
};

export const fetchNewsRemote = async (isAdmin = false) => {
  try {
    const timestamp = Date.now();
    const url = `${getApiUrl('news.php')}?_t=${timestamp}${isAdmin ? '&admin=true' : ''}`;
    const response = await fetch(url, { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      const records = json.records || (Array.isArray(json) ? json : []);

      if (Array.isArray(records)) {
        localStorage.setItem('keskese_news_db', JSON.stringify(records));
        if (isAdmin) {
          // For Admin portal: return database records directly so editing/deleting dynamic posts works seamlessly
          return records.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        } else {
          // For Public site: combine the 2 static initial events with DB posts for fast loading
          const merged = [...initialNews, ...records];
          return merged.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        }
      }
    }
  } catch (err) {
    console.warn('MySQL news fetch error, using static & cached events:', err);
  }

  if (isAdmin) {
    const cachedDb = localStorage.getItem('keskese_news_db');
    return cachedDb ? JSON.parse(cachedDb) : [];
  }
  return getNews();
};

export const addNewsPost = async (post) => {
  let createdId = generateId();
  try {
    const res = await fetch(getApiUrl('news.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    const json = await res.json();
    if (json.status === 'success' && json.id) {
      createdId = json.id;
    }
  } catch (err) {
    console.warn('Failed to publish news post to MySQL:', err);
  }

  const cachedDb = localStorage.getItem('keskese_news_db');
  const posts = cachedDb ? JSON.parse(cachedDb) : [];
  posts.unshift({ ...post, id: createdId, createdAt: new Date().toISOString() });
  localStorage.setItem('keskese_news_db', JSON.stringify(posts));
  return createdId;
};

export const updateNewsPost = async (id, data) => {
  try {
    await fetch(getApiUrl('news.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
  } catch (err) {
    console.warn('Failed to update news post in MySQL:', err);
  }

  const cachedDb = localStorage.getItem('keskese_news_db');
  const posts = cachedDb ? JSON.parse(cachedDb) : [];
  const index = posts.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    posts[index] = { ...posts[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('keskese_news_db', JSON.stringify(posts));
  }
};

export const deleteNewsPost = async (id) => {
  try {
    await fetch(`${getApiUrl('news.php')}?action=delete&id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  } catch (err) {
    console.warn('Failed to delete news post from MySQL:', err);
  }

  const cachedDb = localStorage.getItem('keskese_news_db');
  const posts = cachedDb ? JSON.parse(cachedDb) : [];
  const updated = posts.filter(p => String(p.id) !== String(id));
  localStorage.setItem('keskese_news_db', JSON.stringify(updated));
};

export const getMembers = () => {
  const members = localStorage.getItem('keskese_members');
  return members ? JSON.parse(members) : [];
};

export const fetchMembersRemote = async (page = 1, limit = 10, search = '') => {
  const isLocal = window.location.origin.includes('localhost');
  const baseUrl = isLocal ? 'http://localhost/keskese/api/members.php' : '/api/members.php';

  try {
    const timestamp = Date.now();
    const queryParams = new URLSearchParams({ page, limit, search, _t: timestamp }).toString();
    const response = await fetch(`${baseUrl}?${queryParams}`, { cache: 'no-store' });
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (json.status === 'success') {
        localStorage.setItem('keskese_members', JSON.stringify(json.records));
        return json;
      } else if (Array.isArray(json)) {
        localStorage.setItem('keskese_members', JSON.stringify(json));
        return { records: json, total_records: json.length, total_pages: 1, current_page: 1 };
      }
    }
  } catch (err) {
    console.warn('PHP MySQL members fetch error, falling back to Google Sheets / localStorage:', err);
  }

  const googleScriptUrl = getGoogleScriptUrl();
  if (googleScriptUrl) {
    try {
      const response = await fetch(`${googleScriptUrl}?type=members`);
      if (response.ok) {
        const remoteMembers = await response.json();
        if (Array.isArray(remoteMembers)) {
          localStorage.setItem('keskese_members', JSON.stringify(remoteMembers));
          return { records: remoteMembers, total_records: remoteMembers.length, total_pages: 1, current_page: 1 };
        }
      }
    } catch (e) {}
  }

  const cached = getMembers();
  return { records: cached, total_records: cached.length, total_pages: 1, current_page: 1 };
};

export const addMember = (member) => {
  const members = getMembers();
  members.push({ ...member, id: member.id || generateId(), dateJoined: member.dateJoined || new Date().toISOString() });
  localStorage.setItem('keskese_members', JSON.stringify(members));
};

export const deleteMember = async (id) => {
  const isLocal = window.location.origin.includes('localhost');
  const baseUrl = isLocal ? 'http://localhost/keskese/api/members.php' : '/api/members.php';

  try {
    await fetch(`${baseUrl}?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  } catch (err) {
    console.warn('Failed to delete member from MySQL:', err);
  }

  const members = getMembers();
  localStorage.setItem('keskese_members', JSON.stringify(members.filter(m => m.id !== id && m.memberId !== id)));
};

export const exportAllData = () => {
  const data = {
    keskese_news: getNews(),
    keskese_members: getMembers()
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.keskese_news) localStorage.setItem('keskese_news', JSON.stringify(data.keskese_news));
    if (data.keskese_members) localStorage.setItem('keskese_members', JSON.stringify(data.keskese_members));
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
};
