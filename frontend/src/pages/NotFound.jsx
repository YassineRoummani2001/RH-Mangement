import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      padding: '24px',
      textAlign: 'center'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '500px' }}
      >
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{ 
              fontSize: '150px', 
              fontWeight: 900, 
              margin: 0, 
              lineHeight: 1,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.15
            }}
          >
            404
          </motion.h1>
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '100%'
          }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              backgroundColor: 'var(--primary-bg)', 
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--primary)',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.1)'
            }}>
              <Search size={48} />
            </div>
          </div>
        </div>

        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          color: isDark ? '#f1f5f9' : '#0f172a', 
          marginBottom: '16px',
          letterSpacing: '-.02em'
        }}>
          Oups ! Page introuvable
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: isDark ? '#94a3b8' : '#64748b', 
          lineHeight: '1.6', 
          marginBottom: '40px'
        }}>
          Désolé, la page que vous recherchez semble avoir été déplacée ou n'existe plus dans notre système RH.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '14px 24px', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Home size={18} /> Retour au Dashboard
            </motion.button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: 'transparent', 
              color: isDark ? '#f1f5f9' : '#0f172a', 
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
              padding: '14px 24px', 
              borderRadius: '12px', 
              fontWeight: 700, 
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Page précédente
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
