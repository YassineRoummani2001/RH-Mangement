import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Mail, ArrowLeft, Loader2,
  Sun, Moon, AlertCircle, CheckCircle2
} from 'lucide-react';

const ForgotPassword = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Mock password reset request
    setTimeout(() => {
      if (email.includes('@')) {
        setIsSuccess(true);
        setIsLoading(false);
      } else {
        setError(t('auth.invalidEmailError'));
        setIsLoading(false);
      }
    }, 1500);
  };

  const isDark = theme === 'dark';

  const inputStyle = {
    width: '100%',
    padding: '13px 16px 13px 44px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '10px',
    border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
    color: isDark ? '#f1f5f9' : '#0f172a',
    outline: 'none',
    transition: 'border-color .15s, box-shadow .15s, background-color .15s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const onFocus = (e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.12)'; };
  const onBlur  = (e) => { e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', backgroundColor: isDark ? '#0f172a' : '#f8fafc', transition: 'background .3s' }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:block relative overflow-hidden" style={{ width: '55%' }}>
        <img
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=2000"
          alt="Support"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(29,78,216,.92) 0%, rgba(15,23,42,.95) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 4rem', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <img src="/logo.png" alt="RH Logo" style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', objectFit: 'contain', padding: 4 }} />
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-.01em' }}>RH Management</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            {t('auth.forgotTitle').split('oublié')[0]}<br /><span style={{ color: '#93c5fd' }}>{t('auth.forgotTitle').includes('oublié') ? 'oublié ?' : 'forgot?'}</span>
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: 17, lineHeight: 1.7, maxWidth: 340 }}>
            {t('auth.forgotDesc')}
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', backgroundColor: isDark ? '#0f172a' : '#ffffff', transition: 'background .3s', overflow: 'hidden' }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{ position: 'absolute', top: 24, right: 24, padding: '10px', borderRadius: 12, background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <img src="/logo.png" alt="RH Logo" style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', objectFit: 'contain', padding: 3 }} />
            <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', fontSize: 16 }}>RH Management</span>
          </div>

          {!isSuccess ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 8, letterSpacing: '-.02em' }}>
                  {t('auth.resetTitle')}
                </h2>
                <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
                  {t('auth.resetDesc')}
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 10, background: isDark ? 'rgba(239,68,68,.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,.3)' : '#fecaca'}`, color: isDark ? '#f87171' : '#dc2626', fontSize: 14, fontWeight: 500 }}
                  >
                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: isDark ? '#cbd5e1' : '#374151', marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '6px', background: 'rgba(37,99,235,.1)', color: '#2563eb' }}><Mail style={{ width: 12, height: 12 }} /></span>
                    {t('auth.email')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#2563eb', zIndex: 5 }} />
                    <input
                      type="email"
                      placeholder="nom@entreprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  style={{ width: '100%', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 24px', borderRadius: 12, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(37,99,235,.35)', fontFamily: 'inherit' }}
                >
                  {isLoading ? (
                    <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />{t('auth.sending')}</>
                  ) : (
                    t('auth.sendLink')
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 style={{ width: 32, height: 32, color: '#22c55e' }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 12 }}>{t('auth.checkEmailTitle')}</h2>
              <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, marginBottom: 32 }}>
                {t('auth.checkEmailDesc', { email })}
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                {t('auth.resendEmail')}
              </button>
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none', fontSize: 14 }}>
              <ArrowLeft style={{ width: 16, height: 16 }} />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
