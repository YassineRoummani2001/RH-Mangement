import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { triggerWorkflowNotification, logSystemActivity } from '../utils/rbac';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOROCCAN_CITIES } from '../utils/cities';




const statusConfig = {
  'planned': { color: '#3B82F6', bg: '#EFF6FF', icon: 'fas fa-calendar' },
  'inProgress':  { color: '#F59E0B', bg: '#FFFBEB', icon: 'fas fa-spinner' },
  'done':  { color: '#10B981', bg: '#ECFDF5', icon: 'fas fa-check-circle' },
  'cancelled':   { color: '#EF4444', bg: '#FEF2F2', icon: 'fas fa-times-circle' },
};

const DOMAINS = ['Informatique', 'Management', 'Finance', 'RH', 'Commercial', 'Technique', 'Autre'];

export default function Trainings() {
  const { user, effectiveRole } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const isEmployee = effectiveRole === 'EMPLOYEE';
  const isHR = effectiveRole === 'HR_MANAGER' || effectiveRole === 'HR_AGENT';
  const canManage = isHR;

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/formations');
      const mapped = res.data.data.map(t => {
        let status = 'planned';
        if (t.statut === 'EN_COURS') status = 'inProgress';
        if (t.statut === 'TERMINEE') status = 'done';
        if (t.statut === 'ANNULEE') status = 'cancelled';
        
        return {
          id: `FRM-${(t._id || t.id).toString().slice(-6).toUpperCase()}`,
          rawId: t._id || t.id,
          title: t.titre,
          domain: 'Général',
          trainer: 'Formateur Interne',
          rawDateDebut: t.dateDebut,
          startDate: new Date(t.dateDebut).toLocaleDateString('fr-FR'),
          endDate: new Date(t.dateFin).toLocaleDateString('fr-FR'),
          location: t.lieu || 'Non spécifié',
          maxParticipants: t.capacite || 20,
          participants: t.participants ? t.participants.map(p => `${p.prenom} ${p.nom}`) : [],
          status: status
        };
      });
      setTrainings(mapped);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement des formations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const [form, setForm] = useState({
    title: '', domain: 'Informatique', trainer: '', startDate: '', endDate: '',
    location: '', maxParticipants: 15, description: ''
  });
  const handleFormChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      showToast(t('trainings.toast.missingFields'), 'warning');
      return;
    }
    try {
      await api.post('/formations', {
        titre: form.title,
        description: form.description,
        lieu: form.location,
        capacite: Number(form.maxParticipants),
        dateDebut: form.startDate,
        dateFin: form.endDate,
        statut: 'PLANIFIEE'
      });
      showToast(t('trainings.toast.created'), 'success');
      setIsCreateModalOpen(false);
      setForm({ title: '', domain: 'Informatique', trainer: '', startDate: '', endDate: '', location: '', maxParticipants: 15, description: '' });
      fetchTrainings();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la création', 'error');
    }
  };

  const handleEnroll = async (training) => {
    try {
      await api.post(`/formations/${training.rawId}/participer`);
      showToast(t('trainings.toast.enrolled', { title: training.title }), 'success');
      fetchTrainings();
    } catch (err) {
      if (err.response?.data?.message) {
        showToast(err.response.data.message, 'error');
      } else {
        showToast('Erreur lors de l\'inscription', 'error');
      }
    }
  };

  const handleDelete = async (id, rawId) => {
    try {
      await api.delete(`/formations/${rawId}`);
      showToast(t('trainings.toast.deleted'), 'success');
      setIsDetailModalOpen(false);
      fetchTrainings();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const filters = ['all', 'planned', 'inProgress', 'done'];
  const myTrainings = trainings.filter(t => t.participants.includes(user?.name));
  const filtered = trainings.filter(t => activeFilter === 'all' || t.status === activeFilter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data = months.map(m => ({ month: m, formations: 0 }));
    trainings.forEach(t => {
      if (t.rawDateDebut) {
        const d = new Date(t.rawDateDebut);
        const monthIndex = d.getMonth();
        if (monthIndex >= 0 && monthIndex <= 11) {
          data[monthIndex].formations += 1;
        }
      }
    });
    // Return only months from Jan to current month + 1 for cleaner display, or just all if there are formations
    const lastMonthWithData = data.reduce((acc, curr, idx) => curr.formations > 0 ? idx : acc, new Date().getMonth());
    return data.slice(0, Math.max(lastMonthWithData + 1, 6));
  }, [trainings]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1><i className="fas fa-graduation-cap" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
            {isEmployee ? t('trainings.myTitle') : t('trainings.title')}
          </h1>
          <p>{isEmployee ? t('trainings.mySubtitle') : t('trainings.subtitle')}</p>
        </div>
        <div className="header-actions">
          {canManage && (
            <button className="action-btn primary" onClick={() => setIsCreateModalOpen(true)}>
              <i className="fas fa-plus"></i> {t('trainings.newTraining')}
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue-card">
          <div className="stat-header"><div className="stat-icon primary"><i className="fas fa-book"></i></div></div>
          <div className="stat-value">{trainings.length}</div>
          <div className="stat-label">{t('trainings.total')}</div>
        </div>
        <div className="stat-card amber-card">
          <div className="stat-header"><div className="stat-icon warning"><i className="fas fa-spinner"></i></div></div>
          <div className="stat-value">{trainings.filter(t => t.status === 'inProgress').length}</div>
          <div className="stat-label">{t('trainings.inProgress')}</div>
        </div>
        <div className="stat-card emerald-card">
          <div className="stat-header"><div className="stat-icon success"><i className="fas fa-user-graduate"></i></div></div>
          <div className="stat-value">{isEmployee ? myTrainings.length : trainings.reduce((s, t) => s + t.participants.length, 0)}</div>
          <div className="stat-label">{isEmployee ? t('trainings.myEnrollments') : t('trainings.participants')}</div>
        </div>
        <div className="stat-card blue-card">
          <div className="stat-header"><div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><i className="fas fa-calendar-alt"></i></div></div>
          <div className="stat-value">{trainings.filter(t => t.status === 'planned').length}</div>
          <div className="stat-label">{t('trainings.planned')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Training cards */}
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f} className={`filter-pill ${activeFilter === f ? 'filter-pill-blue' : ''}`}
                onClick={() => { setActiveFilter(f); setPage(1); }}>{t(`trainings.filters.${f}`)}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginated.map(training => {
              const cfg = statusConfig[training.status] || statusConfig['planned'];
              const isEnrolled = training.participants.includes(user?.name);
              const isFull = training.participants.length >= training.maxParticipants;
              const pct = Math.round(training.participants.length / training.maxParticipants * 100);
              return (
                <div key={training.id} className="card" style={{ padding: '16px', cursor: 'pointer' }}
                  onClick={() => { setSelectedTraining(training); setIsDetailModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{training.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{training.id} • {training.domain}</span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg, whiteSpace: 'nowrap' }}>
                      <i className={cfg.icon}></i> {t(`trainings.status.${training.status}`)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}><i className="fas fa-user-tie" style={{ marginRight: '5px', color: 'var(--primary)' }}></i>{training.trainer}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '5px', color: '#7C3AED' }}></i>{training.location}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}><i className="fas fa-calendar" style={{ marginRight: '5px', color: '#059669' }}></i>{training.startDate} → {training.endDate}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{t('trainings.card.participants')}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{training.participants.length}/{training.maxParticipants}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isFull ? '#EF4444' : '#10B981', borderRadius: '10px', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  {isEmployee && training.status === 'planned' && (
                    <button
                      onClick={e => { e.stopPropagation(); handleEnroll(training); }}
                      disabled={isFull}
                      style={{ padding: '6px 16px', background: isEnrolled ? '#ECFDF5' : isFull ? 'var(--border-color)' : 'var(--primary)', color: isEnrolled ? '#10B981' : isFull ? 'var(--text-gray)' : '#fff', border: 'none', borderRadius: '8px', cursor: isFull ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                      {isEnrolled ? t('trainings.card.enrolled') : isFull ? t('trainings.card.full') : t('trainings.card.enroll')}
                    </button>
                  )}
                </div>
              );
            })}
            {paginated.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                {t('common.noData')}
              </div>
            )}
            <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} />
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-chart-bar" style={{ color: 'var(--primary)' }}></i> {t('trainings.perMonth')}
          </div>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-gray)" fontSize={11} />
                <YAxis stroke="var(--text-gray)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="formations" name="Formations" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div className="card-title" style={{ marginBottom: '10px' }}><i className="fas fa-layer-group"></i> {t('trainings.byDomain')}</div>
            {['Informatique', 'Management', 'Finance'].map(domain => {
              const count = trainings.filter(t => t.domain === domain).length;
              return (
                <div key={domain} className="progress-item" style={{ marginBottom: '8px' }}>
                  <div className="progress-header"><span>{domain}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(count / trainings.length) * 100}%`, backgroundColor: 'var(--primary)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
        title={t('trainings.modal.createTitle')} icon="fas fa-graduation-cap" iconColor="var(--primary)" iconBg="var(--primary-bg)"
        submitColor="var(--primary)" onSubmit={handleCreate} submitText={t('trainings.modal.submit')}
        isSubmitDisabled={!form.title || !form.startDate || !form.endDate || !form.trainer}>
        <form onSubmit={e => { e.preventDefault(); handleCreate(); }} style={{ padding: '4px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-heading" style={{ color: 'var(--primary)' }}></i> {t('trainings.modal.titleLabel')} *
              </label>
              <input type="text" name="title" className="form-input" placeholder={t('trainings.modal.titlePlaceholder')} value={form.title} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-layer-group" style={{ color: 'var(--c-purple)' }}></i> {t('trainings.modal.domain')}
              </label>
              <select name="domain" className="form-input" value={form.domain} onChange={handleFormChange}>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--c-orange)' }}></i> {t('trainings.modal.trainer')} *
              </label>
              <input type="text" name="trainer" className="form-input" placeholder={t('trainings.modal.trainerPlaceholder')} value={form.trainer} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#E11D48' }}></i> {t('trainings.modal.location')}
              </label>
              <select name="location" className="form-input" value={form.location} onChange={handleFormChange}>
                <option value="">Sélectionner...</option>
                {MOROCCAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="far fa-calendar-alt" style={{ color: 'var(--success)' }}></i> {t('trainings.modal.startDate')} *
              </label>
              <input type="date" name="startDate" className="form-input" value={form.startDate} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="far fa-calendar-check" style={{ color: 'var(--success)' }}></i> {t('trainings.modal.endDate')} *
              </label>
              <input type="date" name="endDate" className="form-input" value={form.endDate} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-users" style={{ color: 'var(--primary)' }}></i> {t('trainings.modal.maxPart')}
              </label>
              <input type="number" name="maxParticipants" className="form-input" min="1" max="100" value={form.maxParticipants} onChange={handleFormChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-align-left" style={{ color: 'var(--text-gray)' }}></i> {t('trainings.modal.description')}
              </label>
              <input type="text" name="description" className="form-input" placeholder={t('trainings.modal.descPlaceholder')} value={form.description} onChange={handleFormChange} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedTraining && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
          title={selectedTraining.title} icon="fas fa-graduation-cap" iconColor="var(--primary)" iconBg="var(--primary-bg)"
          submitColor={null} onSubmit={null} submitText={null}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: 'fas fa-hashtag', color: '#64748B', bg: '#F8FAFC', label: t('common.ref', 'Référence'), value: selectedTraining.id },
              { icon: 'fas fa-layer-group', color: '#8B5CF6', bg: '#F5F3FF', label: t('trainings.modal.domain'), value: selectedTraining.domain },
              { icon: 'fas fa-chalkboard-teacher', color: '#0EA5E9', bg: '#F0F9FF', label: t('trainings.modal.trainer'), value: selectedTraining.trainer },
              { icon: 'fas fa-map-marker-alt', color: '#F59E0B', bg: '#FFFBEB', label: t('trainings.modal.location'), value: selectedTraining.location },
              { icon: 'far fa-calendar-alt', color: '#10B981', bg: '#ECFDF5', label: t('trainings.modal.startDate'), value: selectedTraining.startDate },
              { icon: 'far fa-calendar-check', color: '#10B981', bg: '#ECFDF5', label: t('trainings.modal.endDate'), value: selectedTraining.endDate },
              { icon: 'fas fa-users', color: '#2563EB', bg: '#EFF6FF', label: t('trainings.modal.participantsList'), value: `${selectedTraining.participants.length} / ${selectedTraining.maxParticipants}` },
              { icon: 'fas fa-info-circle', color: '#D97706', bg: '#FEF3C7', label: t('trainings.status.planned', 'Statut'), value: t(`trainings.status.${selectedTraining.status}`) },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 10px', backgroundColor: 'var(--sidebar-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                  <i className={item.icon}></i>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ color: 'var(--text-gray)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.value}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTraining.participants.length > 0 && (
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--sidebar-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-gray)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <i className="fas fa-user-friends" style={{ marginRight: '4px' }}></i> {t('trainings.modal.participantsList')}
              </div>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.8rem', backgroundColor: 'var(--main-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-list-ul" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}></i>
                    {i18n.language === 'fr' ? `Voir les ${selectedTraining.participants.length} participants...` : `View ${selectedTraining.participants.length} participants...`}
                  </span>
                  <i className={`fas fa-chevron-${showParticipantsDropdown ? 'up' : 'down'}`} style={{ color: 'var(--text-gray)', fontSize: '0.75rem' }}></i>
                </div>
                
                {showParticipantsDropdown && (
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '6px', backgroundColor: 'var(--main-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {selectedTraining.participants.map((p, i) => (
                      <div key={i} style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-dark)', borderBottom: i === selectedTraining.participants.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, border: '1px solid rgba(37,99,235,0.1)' }}>
                          {typeof p === 'string' && p.trim() !== '' ? p.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {canManage && (
            <button onClick={() => handleDelete(selectedTraining.id, selectedTraining.rawId)}
              style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#FEF2F2', color: '#EF4444', border: '1px dashed #FECACA', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <i className="fas fa-trash"></i> {t('trainings.modal.delete')}
            </button>
          )}
        </Modal>
      )}
    </motion.div>
  );
}
