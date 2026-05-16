import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, 
  Calendar, AlertTriangle, FileText, Info,
  CheckCircle2, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Notifications = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nouvelle demande de congé', message: 'Ali Benali a soumis une demande de congé annuel pour la période du 20 au 25 mai.', time: 'Il y a 10 min', date: '16 Mai 2026', type: 'request', unread: true, category: 'conge' },
    { id: 2, title: 'Document expiré', message: 'Le contrat de travail de Marc Leblanc arrive à échéance dans 15 jours. Veuillez prévoir le renouvellement.', time: 'Il y a 2h', date: '16 Mai 2026', type: 'alert', unread: true, category: 'document' },
    { id: 3, title: 'Mise à jour du système', message: 'La plateforme RH Management a été mise à jour vers la version 2.4.0. Découvrez les nouveautés.', time: 'Hier', date: '15 Mai 2026', type: 'info', unread: false, category: 'system' },
    { id: 4, title: 'Fiche de paie disponible', message: 'Votre fiche de paie pour le mois d\'Avril 2026 est maintenant disponible au téléchargement.', time: '2 jours', date: '14 Mai 2026', type: 'info', unread: false, category: 'paie' },
    { id: 5, title: 'Alerte Absence', message: 'Leïla Mansour est absente aujourd\'hui sans justificatif préalable.', time: '3 jours', date: '13 Mai 2026', type: 'alert', unread: false, category: 'absence' },
    { id: 6, title: 'Nouveau message RH', message: 'Un nouveau message a été posté dans le canal général.', time: '4 jours', date: '12 Mai 2026', type: 'info', unread: false, category: 'system' },
  ]);

  const filteredNotifs = activeTab === 'all' 
    ? notifications 
    : (activeTab === 'unread' ? notifications.filter(n => n.unread) : notifications.filter(n => n.type === activeTab));

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    showToast('Toutes les notifications marquées comme lues', 'success');
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showToast('Notification supprimée');
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'request': return <FileText size={20} style={{ color: 'var(--primary)' }} />;
      case 'alert': return <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />;
      default: return <Info size={20} style={{ color: 'var(--text-gray)' }} />;
    }
  };

  const getStatusStyle = (notif) => {
    if (notif.unread) {
      return {
        backgroundColor: 'var(--primary-bg)',
        borderColor: 'rgba(37, 99, 235, 0.2)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
      };
    }
    return {
      backgroundColor: 'var(--main-bg)',
      borderColor: 'var(--border-color)',
    };
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', maxWidth: '900px', margin: '0 auto' }}>
      <header className="header" style={{ marginBottom: '24px', flexShrink: 0 }}>
        <div className="header-title">
          <h1>Centre de Notifications</h1>
          <p>Gérez vos alertes et restez informé des activités RH</p>
        </div>
        <div className="header-actions">
          <button onClick={markAllRead} className="action-btn" style={{ gap: '8px' }}>
            <CheckCircle2 size={16} /> Tout marquer lu
          </button>
        </div>
      </header>

      {/* Tabs / Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', flexShrink: 0 }}>
        {[
          { id: 'all', label: 'Toutes', count: notifications.length },
          { id: 'unread', label: 'Non lues', count: notifications.filter(n => n.unread).length },
          { id: 'request', label: 'Demandes', count: notifications.filter(n => n.type === 'request').length },
          { id: 'alert', label: 'Alertes', count: notifications.filter(n => n.type === 'alert').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--main-bg)',
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)',
              color: activeTab === tab.id ? 'white' : 'var(--text-gray)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '99px', 
                fontSize: '11px', 
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--sidebar-bg)',
                color: activeTab === tab.id ? 'white' : 'var(--text-gray)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }}>
        <AnimatePresence mode="popLayout">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((notif, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={notif.id}
                style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid', 
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '16px',
                  transition: 'all 0.2s',
                  ...getStatusStyle(notif)
                }}
                className="glass-card"
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: notif.type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : (notif.type === 'request' ? 'rgba(37, 99, 235, 0.1)' : 'var(--sidebar-bg)'),
                  flexShrink: 0 
                }}>
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>{notif.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-light)' }}>
                      <Calendar size={12} />
                      {notif.date}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: 'var(--text-gray)', lineHeight: '1.6', marginBottom: '16px' }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-light)' }}>{notif.time}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => toggleRead(notif.id)}
                        className="modern-action-btn"
                        style={{ color: notif.unread ? 'var(--primary)' : 'var(--text-gray)' }}
                        title="Marquer comme lu"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => deleteNotif(notif.id)}
                        className="modern-action-btn"
                        style={{ color: 'var(--danger)' }}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 20px', border: '2px dashed var(--border-color)', borderRadius: '24px' }}
            >
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--sidebar-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Bell size={40} style={{ color: 'var(--text-light)' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Aucune notification</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Vous êtes à jour ! Revenez plus tard pour de nouvelles alertes.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
