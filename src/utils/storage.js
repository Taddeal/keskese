import initialNews from '../data/news.json';

// =========================================================================
// CONFIGURATION TOGGLE:
// Set ENABLE_DYNAMIC_NEWS to false (default) to display static Canva news.
// Set ENABLE_DYNAMIC_NEWS to true to reactivate dynamic Google Sheets fetching.
// =========================================================================
export const ENABLE_DYNAMIC_NEWS = false;

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getNews = () => {
  if (!ENABLE_DYNAMIC_NEWS) {
    return initialNews;
  }
  const news = localStorage.getItem('keskese_news');
  if (news) {
    return JSON.parse(news);
  }
  localStorage.setItem('keskese_news', JSON.stringify(initialNews));
  return initialNews;
};

export const ACTIVE_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6UF14quFcku_Wp8FTJboAG10-Mskmdl1fs6Jdiozn8Y7k_xGHGP5mR1ITlmO4GseyLA/exec';

export const getGoogleScriptUrl = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0 && !envUrl.includes('AKfycbyQmang')) {
    return envUrl.trim();
  }
  return ACTIVE_GOOGLE_SCRIPT_URL;
};

export const fetchNewsRemote = async () => {
  if (!ENABLE_DYNAMIC_NEWS) {
    return initialNews;
  }

  const googleScriptUrl = getGoogleScriptUrl();
  if (googleScriptUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout cap

      const response = await fetch(`${googleScriptUrl}?type=news`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const remoteNews = await response.json();
        if (Array.isArray(remoteNews) && remoteNews.length > 0) {
          localStorage.setItem('keskese_news', JSON.stringify(remoteNews));
          return remoteNews;
        }
      }
    } catch (err) {
      console.warn('Google Sheets news fetch timed out or returned error, using fast fallback:', err);
    }
  }
  return getNews();
};

export const saveNews = (posts) => {
  localStorage.setItem('keskese_news', JSON.stringify(posts));
};

export const addNewsPost = (post) => {
  const posts = getNews();
  posts.push({ ...post, id: generateId(), createdAt: new Date().toISOString() });
  saveNews(posts);
};

export const updateNewsPost = (id, data) => {
  const posts = getNews();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...data, updatedAt: new Date().toISOString() };
    saveNews(posts);
  }
};

export const deleteNewsPost = (id) => {
  const posts = getNews();
  saveNews(posts.filter(p => p.id !== id));
};

export const getMembers = () => {
  const members = localStorage.getItem('keskese_members');
  return members ? JSON.parse(members) : [];
};

export const fetchMembersRemote = async () => {
  const googleScriptUrl = getGoogleScriptUrl();
  if (googleScriptUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout cap for Google Apps Script cold starts

      const response = await fetch(`${googleScriptUrl}?type=members`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const remoteMembers = await response.json();
        if (Array.isArray(remoteMembers)) {
          localStorage.setItem('keskese_members', JSON.stringify(remoteMembers));
          return remoteMembers;
        }
      }
    } catch (err) {
      console.warn('Google Sheets members fetch timed out or returned error, using cached fallback:', err);
    }
  }
  return getMembers();
};

export const addMember = (member) => {
  const members = getMembers();
  members.push({ ...member, id: generateId(), dateJoined: new Date().toISOString() });
  localStorage.setItem('keskese_members', JSON.stringify(members));
};

export const deleteMember = (id) => {
  const members = getMembers();
  localStorage.setItem('keskese_members', JSON.stringify(members.filter(m => m.id !== id)));
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
