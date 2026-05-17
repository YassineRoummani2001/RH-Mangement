import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, effectiveRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  // Determine page permissions based on effective dynamically-resolved role
  const isEmployee = effectiveRole === 'EMPLOYEE';
  const isHRManager = effectiveRole === 'HR_MANAGER';
  const isHRAgent = effectiveRole === 'HR_AGENT';
  const isDeptManager = effectiveRole === 'DEPARTMENT_MANAGER' || effectiveRole === 'INTERIM_MANAGER';

  const canSeeEmployees = isHRManager || isHRAgent || isDeptManager;
  const canSeeCompliance = isHRManager || isHRAgent;
  const canSeeCalendar = isHRManager || isHRAgent;
  const canSeeFinance = isHRManager;
  const canSeeSettings = isHRManager;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src="/logo.png" alt="HRConnect Logo" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
        </div>
        <div className="brand-text">
          <span className="brand-title">{t('sidebar.systemTitle')}</span>
          <span className="brand-subtitle">{t('sidebar.systemSubtitle')}</span>
        </div>
        <button className="toggle-sidebar-btn" onClick={() => setCollapsed(!collapsed)}>
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          <span className="nav-text">{t('sidebar.dashboard')}</span>
        </NavLink>

        {canSeeEmployees && (
          <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-users"></i>
            <span className="nav-text">{isHRManager || isHRAgent ? t('sidebar.employees') : t('sidebar.myTeam')}</span>
          </NavLink>
        )}

        <NavLink to="/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <i className="fas fa-file-signature"></i>
          <span className="nav-text">{isEmployee ? t('sidebar.myRequests') : t('sidebar.hrRequests')}</span>
        </NavLink>

        <NavLink to="/leave" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <i className="fas fa-calendar-alt"></i>
          <span className="nav-text">{isEmployee ? t('sidebar.myLeaves') : t('sidebar.leavesAndAbsences')}</span>
        </NavLink>

        {canSeeCalendar && (
          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-calendar-check"></i>
            <span className="nav-text">{t('sidebar.calendar')}</span>
          </NavLink>
        )}

        {canSeeCompliance && (
          <NavLink to="/compliance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-shield-alt"></i>
            <span className="nav-text">{t('sidebar.compliance')}</span>
          </NavLink>
        )}

        {canSeeFinance && (
          <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-wallet"></i>
            <span className="nav-text">{t('sidebar.finance')}</span>
          </NavLink>
        )}

        <div className="nav-divider"></div>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <i className="fas fa-bell"></i>
          <span className="nav-text">{t('sidebar.notifications')}</span>
        </NavLink>

        {canSeeSettings && (
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <i className="fas fa-cog"></i>
            <span className="nav-text">{t('sidebar.settings')}</span>
          </NavLink>
        )}

        {/* Mobile-only theme & profile section */}
        <div className="mobile-only-nav">
          <div className="nav-divider"></div>
          
          <div className="nav-item" onClick={() => toggleTheme()} style={{ cursor: 'pointer' }}>
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
            <span className="nav-text">{theme === 'light' ? t('sidebar.darkMode') : t('sidebar.lightMode')}</span>
          </div>

          <div className="sidebar-user" style={{ borderTop: 'none', padding: '12px 16px' }}>
            <img src={user?.avatar} alt="User" />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">
                {isHRManager ? t('sidebar.hrDirector') : isHRAgent ? 'Agent RH' : isDeptManager ? 'Chef de service' : t('auth.employee')}
              </span>
            </div>
            <button className="logout-btn" onClick={() => logout()} title={t('sidebar.logout')}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
