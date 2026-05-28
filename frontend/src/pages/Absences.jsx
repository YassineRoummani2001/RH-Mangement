import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { logSystemActivity, triggerWorkflowNotification } from '../utils/rbac';



const TYPE_CONFIG = {
  'absence': { color: '#EF4444', bg: '#FEF2F2', icon: 'fas fa-user-times' },
  'late':    { color: '#F59E0B', bg: '#FFFBEB', icon: 'fas fa-clock' },
};
const STATUS_CONFIG = {
  'unjustified':      { color: '#EF4444', bg: '#FEF2F2' },
  'justified':        { color: '#10B981', bg: '#ECFDF5' },
  'justifiedMedical': { color: '#3B82F6', bg: '#EFF6FF' },
  'inProgress':       { color: '#F59E0B', bg: '#FFFBEB' },
};

export default function Absences() {
  const { user, effectiveRole } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [absences, setAbsences] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAbs, setSelectedAbs] = useState(null);
  const [activeType, setActiveType] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const isDeptManager = effectiveRole === 'DEPARTMENT_MANAGER' || effectiveRole === 'INTERIM_MANAGER';
  const isHR = effectiveRole === 'HR_MANAGER' || effectiveRole === 'HR_AGENT';

  const fetchAbsences = async () => {
    try {
      setIsLoadingData(true);
      const [absRes, empRes] = await Promise.all([
        api.get('/absences'),
        api.get('/employes')
      ]);
      const mapped = absRes.data.data.map(abs => {
        // Calculate diff in hours
        const d1 = new Date(abs.dateDebut);
        const d2 = new Date(abs.dateFin);
        const diffHours = Math.max(8, Math.abs(d2 - d1) / 36e5);
        
        let mappedStatus = 'inProgress';
        if (abs.statut === 'JUSTIFIEE') mappedStatus = 'justified';
        if (abs.statut === 'INJUSTIFIEE') mappedStatus = 'unjustified';
        
        return {
          id: `ABS-${(abs._id || abs.id).toString().slice(-6).toUpperCase()}`,
          rawId: abs._id || abs.id,
          employee: abs.employe ? `${abs.employe.prenom} ${abs.employe.nom}` : 'Inconnu',
          dept: abs.employe?.service?.nom || 'Général',
          type: abs.type === 'Retard' ? 'late' : 'absence',
          date: d1.toLocaleDateString('fr-FR'),
          hours: diffHours,
          reason: abs.motif || 'Non précisé',
          justificatif: abs.justificatif,
          status: mappedStatus,
          warning: mappedStatus === 'unjustified'
        };
      });
      setAbsences(mapped);
      setEmployees(empRes.data.data.map(e => `${e.prenom} ${e.nom}`));
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const [form, setForm] = useState({
    employee: '', dept: 'Ingénierie', type: 'absence', date: '', hours: 8, reason: '', status: 'unjustified'
  });
  const [isEmployeeSearchOpen, setIsEmployeeSearchOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  const handleFormChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.date) {
      showToast(t('absences.toast.missingFields'), 'warning');
      return;
    }
    try {
      // Find employee ID from name
      const empRes = await api.get('/employes');
      const empList = empRes.data.data || [];
      const matchedEmp = empList.find(e => `${e.prenom} ${e.nom}` === form.employee);
      
      await api.post('/absences', {
        employe: matchedEmp?._id || matchedEmp?.id || undefined,
        type: form.type === 'late' ? 'Retard' : 'Absence',
        motif: form.reason,
        dateDebut: form.date,
        dateFin: form.date,
        statut: form.status === 'justified' ? 'JUSTIFIEE' : form.status === 'justifiedMedical' ? 'JUSTIFIEE' : 'INJUSTIFIEE'
      });

      if (form.status === 'unjustified') {
        triggerWorkflowNotification(form.employee, 'Avertissement Absence', `Une absence non justifiée du ${form.date} a été enregistrée.`, 'warning');
      }
      logSystemActivity('Enregistrement Absence', user?.name, `${form.type} enregistrée pour ${form.employee} – ${form.date}`);
      showToast(t('absences.toast.recorded', { type: form.type }), 'success');
      setIsCreateModalOpen(false);
      setForm({ employee: '', dept: 'Ingénierie', type: 'absence', date: '', hours: 8, reason: '', status: 'unjustified' });
      fetchAbsences();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleUploadJustificatif = (id) => {
    setAbsences(prev => prev.map(a =>
      a.id === id ? { ...a, justificatif: 'justificatif_uploaded.pdf', status: 'justified', warning: false } : a
    ));
    showToast(t('absences.toast.justifAdded'), 'success');
  };

  const typeFilters = ['all', 'absence', 'late'];
  const filtered = absences
    .filter(a => isDeptManager ? a.dept === user?.dept : true)
    .filter(a => activeType === 'all' || a.type === activeType);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalAbsences = absences.filter(a => a.type === 'absence').length;
  const totalRetards = absences.filter(a => a.type === 'late').length;
  const nonJustifiees = absences.filter(a => a.status === 'unjustified').length;
  const avecJustificatif = absences.filter(a => a.justificatif).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1><i className="fas fa-user-times" style={{ color: '#EF4444', marginRight: '10px' }}></i>
            {t('absences.title')}
          </h1>
          <p>{t('absences.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setIsCreateModalOpen(true)}>
            <i className="fas fa-plus"></i> {t('absences.record')}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card red-card">
          <div className="stat-header"><div className="stat-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}><i className="fas fa-user-times"></i></div></div>
          <div className="stat-value">{totalAbsences}</div>
          <div className="stat-label">{t('absences.totalAbsences')}</div>
        </div>
        <div className="stat-card amber-card">
          <div className="stat-header"><div className="stat-icon warning"><i className="fas fa-clock"></i></div></div>
          <div className="stat-value">{totalRetards}</div>
          <div className="stat-label">{t('absences.totalLate')}</div>
        </div>
        <div className="stat-card red-card">
          <div className="stat-header"><div className="stat-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}><i className="fas fa-exclamation-triangle"></i></div></div>
          <div className="stat-value">{nonJustifiees}</div>
          <div className="stat-label">{t('absences.unjustified')}</div>
        </div>
        <div className="stat-card emerald-card">
          <div className="stat-header"><div className="stat-icon success"><i className="fas fa-paperclip"></i></div></div>
          <div className="stat-value">{avecJustificatif}</div>
          <div className="stat-label">{t('absences.withDoc')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">{t('absences.registry')}</h3>
          <div className="filter-group">
            {typeFilters.map(f => (
              <button key={f} className={`filter-pill ${activeType === f ? 'filter-pill-blue' : ''}`}
                onClick={() => { setActiveType(f); setPage(1); }}>{t(`absences.filters.${f}`)}</button>
            ))}
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('absences.table.ref')}</th>
                <th>{t('absences.table.employee')}</th>
                <th>{t('absences.table.department')}</th>
                <th>{t('absences.table.type')}</th>
                <th>{t('absences.table.date')}</th>
                <th>{t('absences.table.duration')}</th>
                <th>{t('absences.table.status')}</th>
                <th>{t('absences.table.warning')}</th>
                <th>{t('absences.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>{t('absences.table.noData')}</td></tr>
              ) : paginated.map(abs => {
                const typeCfg = TYPE_CONFIG[abs.type];
                const stsCfg = STATUS_CONFIG[abs.status] || STATUS_CONFIG['inProgress'];
                return (
                  <tr key={abs.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8rem' }}>{abs.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{abs.employee}</td>
                    <td><span className="filter-tag blue">{abs.dept}</span></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: typeCfg.color, backgroundColor: typeCfg.bg }}>
                        <i className={typeCfg.icon}></i> {t(`absences.modal.${abs.type}`)}
                      </span>
                    </td>
                    <td>{abs.date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{abs.hours}h</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: stsCfg.color, backgroundColor: stsCfg.bg }}>
                        {t(`absences.status_values.${abs.status}`)}
                      </span>
                    </td>
                    <td>
                      {abs.warning
                        ? <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}><i className="fas fa-exclamation-triangle"></i> {t('absences.table.warningSent')}</span>
                        : <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>{t('absences.table.noWarning')}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setSelectedAbs(abs); setIsDetailModalOpen(true); }}
                          style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          <i className="fas fa-eye"></i>
                        </button>
                        {!abs.justificatif && (
                          <button onClick={() => handleUploadJustificatif(abs.id)}
                            style={{ background: '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            <i className="fas fa-paperclip"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
        title={t('absences.modal.createTitle')} icon="fas fa-user-times" iconColor="#EF4444" iconBg="#FEF2F2"
        submitColor="#EF4444" onSubmit={handleCreate} submitText={t('absences.modal.submit')}
        isSubmitDisabled={!form.employee || !form.date}>
        <form onSubmit={e => { e.preventDefault(); handleCreate(); }} style={{ padding: '4px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0, position: 'relative', zIndex: 100 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-user" style={{ color: 'var(--primary)' }}></i> {t('absences.modal.employeeName')} *
              </label>
              <div 
                className="form-input" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--main-bg)' }}
                onClick={() => setIsEmployeeSearchOpen(!isEmployeeSearchOpen)}
              >
                <span style={{ color: form.employee ? 'inherit' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {form.employee ? <i className="fas fa-user-circle" style={{ color: 'var(--primary)' }}></i> : null}
                  {form.employee || t('absences.modal.employeeName')}
                </span>
                <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}></i>
              </div>
              {isEmployeeSearchOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--main-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 9999, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--sidebar-bg)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Rechercher..." 
                      value={employeeSearch} 
                      onChange={e => setEmployeeSearch(e.target.value)} 
                      style={{ padding: '6px 10px', minHeight: '32px', marginBottom: 0, backgroundColor: 'var(--main-bg)' }}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: 'var(--main-bg)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    {employees.filter(e => e.toLowerCase().includes(employeeSearch.toLowerCase())).map(emp => (
                      <div 
                        key={emp} 
                        style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background-color 0.1s' }}
                        onClick={() => { setForm(p => ({ ...p, employee: emp })); setIsEmployeeSearchOpen(false); setEmployeeSearch(''); }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-bg)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                          {emp.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 500 }}>{emp}</span>
                      </div>
                    ))}
                    {employees.filter(e => e.toLowerCase().includes(employeeSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-gray)', textAlign: 'center' }}>Aucun trouvé</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-building" style={{ color: 'var(--c-orange)' }}></i> {t('absences.modal.department')}
              </label>
              <select name="dept" className="form-input" value={form.dept} onChange={handleFormChange}>
                <option>Ingénierie</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>RH</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-tag" style={{ color: 'var(--c-purple)' }}></i> {t('absences.modal.type')} *
              </label>
              <select name="type" className="form-input" value={form.type} onChange={handleFormChange}>
                <option value="absence">{t('absences.modal.absence')}</option>
                <option value="late">{t('absences.modal.late')}</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--primary)' }}></i> {t('absences.modal.statusLabel')}
              </label>
              <select name="status" className="form-input" value={form.status} onChange={handleFormChange}>
                <option value="unjustified">{t('absences.status_values.unjustified')}</option>
                <option value="justified">{t('absences.status_values.justified')}</option>
                <option value="justifiedMedical">{t('absences.status_values.justifiedMedical')}</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="far fa-calendar-alt" style={{ color: 'var(--success)' }}></i> {t('absences.modal.date')} *
              </label>
              <input type="date" name="date" className="form-input" value={form.date} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-clock" style={{ color: '#E11D48' }}></i> {t('absences.modal.durationHours')}
              </label>
              <input type="number" name="hours" className="form-input" min="0.5" max="8" step="0.5" value={form.hours} onChange={handleFormChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-align-left" style={{ color: 'var(--text-gray)' }}></i> {t('absences.modal.reason')}
              </label>
              <input type="text" name="reason" className="form-input" placeholder={t('absences.modal.reasonPlaceholder')} value={form.reason} onChange={handleFormChange} />
            </div>
          </div>
          {form.status === 'unjustified' && form.type === 'absence' && (
            <div style={{ background: '#FEF2F2', borderRadius: '10px', padding: '10px 14px', fontSize: '0.75rem', color: '#B91C1C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <i className="fas fa-exclamation-triangle"></i>
              {t('absences.modal.warningAlert')}
            </div>
          )}
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedAbs && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
          title={t('absences.modal.detailTitle', { id: selectedAbs.id })} icon="fas fa-user-times" iconColor="#EF4444" iconBg="#FEF2F2"
          submitColor={null} onSubmit={null} submitText={null}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: 'fas fa-user', color: '#2563EB', bg: '#EFF6FF', label: t('absences.table.employee'), value: selectedAbs.employee },
              { icon: 'fas fa-building', color: '#8B5CF6', bg: '#F5F3FF', label: t('absences.table.department'), value: selectedAbs.dept },
              { icon: 'fas fa-tag', color: '#F59E0B', bg: '#FFFBEB', label: t('absences.table.type'), value: t(`absences.modal.${selectedAbs.type}`) },
              { icon: 'far fa-calendar-alt', color: '#10B981', bg: '#ECFDF5', label: t('absences.table.date'), value: selectedAbs.date },
              { icon: 'far fa-clock', color: '#E11D48', bg: '#FFF1F2', label: t('absences.table.duration'), value: `${selectedAbs.hours}h` },
              { icon: 'fas fa-align-left', color: '#64748B', bg: '#F8FAFC', label: t('absences.modal.reason'), value: selectedAbs.reason || '—' },
              { icon: 'fas fa-info-circle', color: '#0EA5E9', bg: '#F0F9FF', label: t('absences.table.status'), value: t(`absences.status_values.${selectedAbs.status}`) },
              { icon: 'fas fa-exclamation-triangle', color: '#D97706', bg: '#FEF3C7', label: t('absences.table.warning'), value: selectedAbs.warning ? t('absences.table.warningSent') : t('absences.table.noWarning') },
              { icon: 'fas fa-file-alt', color: '#0D9488', bg: '#F0FDFA', label: 'Justificatif', value: selectedAbs.justificatif || t('absences.table.noJustif') },
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
            {!selectedAbs.justificatif && (
              <button onClick={() => { handleUploadJustificatif(selectedAbs.id); setIsDetailModalOpen(false); }}
                style={{ padding: '8px 10px', background: '#ECFDF5', color: '#10B981', border: '1px dashed #34D399', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', height: '100%', minHeight: '50px' }}>
                <i className="fas fa-paperclip"></i> {t('absences.modal.addJustif')}
              </button>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
