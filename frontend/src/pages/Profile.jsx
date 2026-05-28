import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { User, Mail, Phone, Calendar, Briefcase, MapPin, Shield, Edit3, Key, Clock, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, effectiveRole } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/me');
      const data = res.data.data;
      setProfileData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Dynamic employee details loaded from local settings
  const formatHireDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      const monthsFR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const currentLang = localStorage.getItem('i18nextLng') || 'fr';
      const months = currentLang.startsWith('fr') ? monthsFR : monthsEN;
      const mIdx = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${months[mIdx] || ''} ${year}`;
    }
    return dateStr;
  };

  const savedProfile = localStorage.getItem('hr_profile_data');
  let employeeDetails = {
    phone: profileData?.employe?.telephone || '+212 6 12 34 56 78',
    department: profileData?.employe?.service?.nom || 'Ressources Humaines',
    hireDate: profileData?.employe?.dateEmbauche ? formatHireDate(profileData.employe.dateEmbauche.split('T')[0]) : '12 Janvier 2024',
    contractType: profileData?.employe?.statut === 'ACTIF' ? 'CDI (Temps Plein)' : 'CDI',
    location: profileData?.employe?.adresse || 'Rabat, Maroc',
    annualLeavesUsed: 4,
    annualLeavesTotal: 22,
    sickLeavesUsed: 2,
    sickLeavesTotal: 8,
  };

  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      employeeDetails = {
        ...employeeDetails,
        phone: parsed.phone || employeeDetails.phone,
        department: parsed.department || employeeDetails.department,
        hireDate: parsed.hireDate ? formatHireDate(parsed.hireDate) : employeeDetails.hireDate,
        contractType: parsed.contractType || employeeDetails.contractType,
        location: parsed.location || employeeDetails.location,
      };
    } catch (e) {
      console.error(e);
    }
  }

  const remainingAnnual = employeeDetails.annualLeavesTotal - employeeDetails.annualLeavesUsed;
  const remainingSick = employeeDetails.sickLeavesTotal - employeeDetails.sickLeavesUsed;
  const totalRemaining = remainingAnnual + remainingSick;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <header className="header" style={{ marginBottom: '24px' }}>
        <div className="header-title">
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>
      </header>

      {/* Hero Profile Card */}
      <div 
        className="card" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px', 
          padding: '32px', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, var(--sidebar-bg), rgba(37, 99, 235, 0.05))',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '200px', 
            height: '200px', 
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        ></div>

        <img 
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=2563EB&color=fff`} 
          alt={user?.name} 
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '4px solid var(--main-bg)', 
            boxShadow: 'var(--shadow-card)',
            objectFit: 'cover'
          }} 
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>{user?.name}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`filter-tag ${user?.role === 'HR_MANAGER' ? 'blue' : 'green'}`} style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
              {user?.role === 'HR_MANAGER' ? t('profile.hrManager') : t('profile.employee')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
              {t('profile.online')}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} /> {user?.email}
          </p>
        </div>
      </div>

      {/* Grid Details */}
      <div className="two-col-grid">
        {/* Left Column: Job & Contact Info */}
        <div className="card">
          <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
            <User size={18} color="var(--primary)" />
            {t('profile.professionalInfo')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Briefcase size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.postTitle')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{profileData?.employe?.poste || 'Directrice des Ressources Humaines'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-purple)' }}>
                <Shield size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.department')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{employeeDetails.department}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <Calendar size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.hireDate')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{employeeDetails.hireDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.contractType')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{employeeDetails.contractType}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                <Phone size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.phone')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{employeeDetails.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(107, 114, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)' }}>
                <MapPin size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('profile.location')}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{employeeDetails.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leave Balance & Recent History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: Leave Balance overview */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <Calendar size={18} color="var(--success)" />
              {t('profile.remainingLeaves')}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                  {totalRemaining} <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 500 }}>{t('profile.daysRemaining')}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 500, marginBottom: '4px' }}>
                      <span>{t('profile.annualLeaves')}</span>
                      <span>{remainingAnnual} / {employeeDetails.annualLeavesTotal} j</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(remainingAnnual / employeeDetails.annualLeavesTotal) * 100}%`, height: '100%', background: '#10B981' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 500, marginBottom: '4px' }}>
                      <span>{t('profile.sickLeaves')}</span>
                      <span>{remainingSick} / {employeeDetails.sickLeavesTotal} j</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(remainingSick / employeeDetails.sickLeavesTotal) * 100}%`, height: '100%', background: '#F59E0B' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Profile Activity / Quick Navigation */}
          {effectiveRole === 'HR_MANAGER' && (
            <div className="card">
              <div className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <Clock size={18} color="var(--c-orange)" />
                {t('profile.quickActionsSettings')}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Link 
                  to="/settings" 
                  state={{ tab: 'profil' }}
                  className="action-btn primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', height: '40px' }}
                >
                  <Edit3 size={16} />
                  <span>{t('profile.editProfile')}</span>
                </Link>
                <Link 
                  to="/settings" 
                  state={{ tab: 'securite' }}
                  className="action-btn" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', height: '40px' }}
                >
                  <Key size={16} />
                  <span>{t('profile.security')}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
