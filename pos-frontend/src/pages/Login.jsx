import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send login request to backend
      const response = await api.post('/auth/login', { username, password });

      // 1. Store token and role in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      // 2. Role-based navigation
      if (response.data.role === 'admin' || response.data.role === 'manager') {
        navigate('/inventory');
      } else {
        navigate('/');
      }
    } catch (err) {
      
      const errorCode = err.response?.data?.errorCode || 'CONNECTION_ERROR';

      
      setError(t(`ERRORS.${errorCode}`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-800 p-8">
        
        {/* Header / Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/30 mb-3">
            POS
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('LOGIN.TITLE') || 'Sign In to POS'}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('LOGIN.SUBTITLE') || 'Enter your credentials to access the register'}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {t('LOGIN.USERNAME') || 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t('LOGIN.USERNAME_PLACEHOLDER') || 'Enter your username'}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {t('LOGIN.PASSWORD') || 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('LOGIN.PASSWORD_PLACEHOLDER') || 'Enter your password'}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t('LOGIN.AUTHENTICATING') || 'Authenticating...'}</span>
              </>
            ) : (
              <span>{t('LOGIN.SUBMIT') || 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-8 -mb-8 p-6 rounded-b-2xl border-dashed">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            {t('LOGIN.DEMO_ACCOUNTS') || 'Demo Accounts'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <span className="font-bold block text-slate-800">Manager</span>
              admin / 123456
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <span className="font-bold block text-slate-800">Cashier</span>
              cashier / 123456
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}