import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import About from './pages/About';
import Plans from './pages/Plans';
import Projects from './pages/Projects';
import News from './pages/News';
import Contact from './pages/Contact';
import Membership from './pages/Membership';

import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './pages/admin/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminMembers from './pages/admin/AdminMembers';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="plans" element={<Plans />} />
            <Route path="projects" element={<Projects />} />
            <Route path="news" element={<News />} />
            <Route path="contact" element={<Contact />} />
            <Route path="membership" element={<Membership />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="members" element={<AdminMembers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
