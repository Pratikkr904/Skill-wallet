import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import { NotificationProvider } from './components/NotificationProvider';
import { DarkModeProvider } from './components/DarkModeProvider';
import './App.css';

function App() {
  const token = localStorage.getItem('skillswap_token');

  return (
    <DarkModeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Navbar />
          <div className="page-container">
            <Routes>
              <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;
