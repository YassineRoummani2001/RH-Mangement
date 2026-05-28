import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { jsPDF } from 'jspdf';
import { triggerWorkflowNotification, logSystemActivity } from '../utils/rbac';

const DOC_TYPES = [
  { value: 'travail',       label: 'Attestation de Travail',   icon: 'fas fa-briefcase',          color: '#2563EB', bg: '#EFF6FF', filterValue: 'work' },
  { value: 'salaire',       label: 'Attestation de Salaire',   icon: 'fas fa-money-bill-wave',    color: '#059669', bg: '#ECFDF5', filterValue: 'salary' },
  { value: 'administratif', label: 'Bulletin de Paie',         icon: 'fas fa-file-invoice-dollar', color: '#7C3AED', bg: '#F5F3FF', filterValue: 'payslip' },
];

const statusConfig = {
  'EN_ATTENTE':   { color: '#F59E0B', bg: '#FFFBEB', icon: 'fas fa-hourglass-half',  label: 'En attente' },
  'GENEREE':      { color: '#3B82F6', bg: '#EFF6FF', icon: 'fas fa-pen',             label: 'En traitement' },
  'SIGNEE':       { color: '#10B981', bg: '#ECFDF5', icon: 'fas fa-check-circle',    label: 'Disponible' },
  'REFUSEE':      { color: '#EF4444', bg: '#FEF2F2', icon: 'fas fa-times-circle',    label: 'Refusée' },
};

export default function Attestations() {
  const { user, effectiveRole } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const isEmployee = effectiveRole === 'EMPLOYEE';
  const isHR = effectiveRole === 'HR_MANAGER' || effectiveRole === 'HR_AGENT';
  const isSecretary = effectiveRole === 'SECRETARY_GENERAL';

  const [form, setForm] = useState({ type: 'travail', note: '' });
  const handleFormChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const fetchAttestations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/attestations');
      const mapped = (res.data.data || []).map(att => ({
        id: `DOC-${(att._id || att.id).toString().slice(-6).toUpperCase()}`,
        rawId: att._id || att.id,
        type: DOC_TYPES.find(d => d.value === att.type)?.label || att.type,
        typeValue: att.type,
        employee: att.employe ? `${att.employe.prenom} ${att.employe.nom}` : 'Inconnu',
        dept: att.employe?.service?.nom || 'Général',
        requestedAt: att.dateDemande ? new Date(att.dateDemande).toLocaleDateString('fr-FR') : '',
        status: att.statut === 'SIGNEE' ? 'available' : att.statut === 'GENEREE' ? 'waitingSignature' : att.statut === 'REFUSEE' ? 'refused' : 'processing',
        statut: att.statut,
        signedBy: att.signatureRH ? user?.name : null,
      }));
      setDocs(mapped.reverse());
    } catch (err) {
      console.error(err);
      showToast('Erreur chargement attestations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttestations();
  }, []);



  const handleRequest = async () => {
    try {
      await api.post('/attestations', { type: form.type, note: form.note });
      triggerWorkflowNotification('Agent RH', 'Nouvelle demande d\'attestation', `${user?.name} a demandé une attestation de type ${form.type}.`, 'request');
      showToast(t('attestations.toast.submitted'), 'success');
      setIsRequestModalOpen(false);
      setForm({ type: 'travail', note: '' });
      fetchAttestations();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la soumission', 'error');
    }
  };

  const generatePDF = (doc) => {
    showToast(t('attestations.toast.generating'), 'info');
    setTimeout(() => {
      const img = new Image();
      img.src = '/logo.png';
      img.onload = () => {
        const pdf = new jsPDF();
        const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        // Header Logo
        pdf.addImage(img, 'PNG', 20, 15, 40, 18);

        // Header Text Right
        pdf.setTextColor(15, 23, 42); // Dark blue-gray
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('RH MANAGEMENT S.A.', 190, 20, { align: 'right' });

        pdf.setTextColor(100, 116, 139); // Slate gray
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Quartier des Affaires, Casablanca, Maroc', 190, 27, { align: 'right' });
        pdf.text('Tél : +212 5 22 00 00 00', 190, 33, { align: 'right' });
        pdf.text('Email : contact@rh-management.com', 190, 39, { align: 'right' });

        // Separator Line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(20, 48, 190, 48);

        // Date
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(11);
        pdf.text(`Fait à Casablanca, le ${today}`, 190, 65, { align: 'right' });

        // Title
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text(doc.type.toUpperCase(), 105, 85, { align: 'center' });
        const typeColor = doc.type.includes('Salaire') ? [5, 150, 105] : doc.type.includes('Bulletin') ? [124, 58, 237] : [37, 99, 235];
        pdf.setDrawColor(...typeColor);
        pdf.setLineWidth(0.8);
        const tw = pdf.getTextWidth(doc.type.toUpperCase());
        pdf.line(105 - tw / 2, 88, 105 + tw / 2, 88);

        // Body
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Je soussigné(e), Directeur des Ressources Humaines de la société RH MANAGEMENT S.A.,', 20, 105, { maxWidth: 170 });
        pdf.text('certifie et atteste par la présente que :', 20, 118);

        // Info box
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(20, 128, 170, 40, 4, 4, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(20, 128, 170, 40, 4, 4, 'S');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Collaborateur :', 25, 140);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.employee, 65, 140);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Département :', 25, 152);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.dept, 65, 152);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Statut :', 25, 164);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Employé Actif', 65, 164);

        pdf.text('Est régulièrement employé(e) au sein de notre établissement.', 20, 175);
        // Footer Text
        pdf.setFontSize(11);
        pdf.text('Ce document est délivré pour servir et valoir ce que de droit.', 20, 185);

        // Signatures area
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Signature RH', 40, 205);
        pdf.text('Signature Direction', 140, 205);

        pdf.setFont('helvetica', 'normal');
        if (doc.statut === 'SIGNEE' && doc.signedBy) {
          pdf.setTextColor(190, 24, 93);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Approuvé par: ${doc.signedBy}`, 130, 225);
          pdf.setFont('helvetica', 'normal');
        } else {
          pdf.setTextColor(148, 163, 184);
          pdf.text('(En attente)', 143, 215);
        }

        // Seal
        pdf.setDrawColor(...typeColor);
        pdf.setTextColor(...typeColor);
        pdf.setLineWidth(0.5);
        pdf.circle(155, 235, 14);
        pdf.setFontSize(7);
        pdf.text('CACHET', 155, 233, { align: 'center' });
        pdf.text('OFFICIEL', 155, 238, { align: 'center' });

        // Footer
        const ph = pdf.internal.pageSize.height;
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, ph - 20, 210, 20, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.line(0, ph - 20, 210, ph - 20);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text('RH MANAGEMENT S.A. — Document généré électroniquement — Valeur juridique garantie', 105, ph - 12, { align: 'center' });
        pdf.text(`Réf: ${doc.id} | Généré le ${today}`, 105, ph - 6, { align: 'center' });

        pdf.save(`${doc.type.replace(/\s+/g, '_')}_${doc.employee.replace(/\s+/g, '_')}_${doc.id}.pdf`);
        showToast(t('attestations.toast.generated'), 'success');
        logSystemActivity('Génération PDF', user?.name, `Document ${doc.id} – ${doc.type} généré pour ${doc.employee}`);
      }; // end of img.onload
    }, 800);
  };

  const tabs = ['all', 'work', 'salary', 'payslip'];
  
  const getTabTypeValue = (tab) => {
    if (tab === 'work') return 'travail';
    if (tab === 'salary') return 'salaire';
    if (tab === 'payslip') return 'administratif';
    return null;
  };

  const filtered = docs.filter(d => {
    if (isEmployee) return d.employee === user?.name;
    return true;
  }).filter(d => {
    const tabType = getTabTypeValue(activeTab);
    return !tabType || d.typeValue === tabType;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1><i className="fas fa-file-alt" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
            {isEmployee ? t('attestations.myTitle') : isSecretary ? t('attestations.sgTitle') : t('attestations.title')}
          </h1>
          <p>
            {isEmployee ? t('attestations.mySubtitle')
              : isSecretary ? t('attestations.sgSubtitle')
              : t('attestations.subtitle')}
          </p>
        </div>
        <div className="header-actions">
          {isEmployee && (
            <button className="action-btn primary" onClick={() => setIsRequestModalOpen(true)}>
              <i className="fas fa-plus"></i> {t('attestations.requestDoc')}
            </button>
          )}
          {isHR && (
            <button className="action-btn primary" onClick={async () => {
              showToast(t('attestations.toast.generateMonthly'), 'info');
              try {
                const empRes = await api.get('/employes');
                const employees = empRes.data.data;
                const newDocs = employees.map((emp, index) => ({
                  employe: emp._id,
                  type: 'Bulletin de Paie (Mai)',
                  statut: 'SIGNEE',
                  dateDemande: new Date(),
                  dateGeneration: new Date(),
                  signatureChef: true,
                  signatureRH: true
                }));
                await Promise.all(newDocs.map(doc => api.post('/attestations', doc)));
                fetchAttestations();
                showToast(t('attestations.toast.generated'), 'success');
              } catch (e) {
                showToast('Erreur génération', 'error');
              }
            }}>
              <i className="fas fa-file-invoice-dollar"></i> {t('attestations.generateMonthly')}
            </button>
          )}
        </div>
      </header>

      {/* Doc Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {DOC_TYPES.map(dt => {
          const count = docs.filter(d => d.typeValue === dt.value && (isEmployee ? d.employee === user?.name : true)).length;
          return (
            <div key={dt.value} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', borderTop: `3px solid ${dt.color}` }}
              onClick={() => { setActiveTab(dt.filterValue); setPage(1); }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: dt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dt.color, fontSize: '1.1rem', flexShrink: 0 }}>
                <i className={dt.icon}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{t(`attestations.filters.${dt.filterValue}`)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">{t('attestations.available')}</h3>
          <div className="filter-group">
            {tabs.map(t_id => (
              <button key={t_id} className={`filter-pill ${activeTab === t_id ? 'filter-pill-blue' : ''}`}
                onClick={() => { setActiveTab(t_id); setPage(1); }}>{t(`attestations.filters.${t_id}`)}</button>
            ))}
          </div>
        </div>
        <div className="table-container table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t('attestations.table.ref')}</th>
                <th>{t('attestations.table.type')}</th>
                {!isEmployee && <th>{t('attestations.table.employee')}</th>}
                {!isEmployee && <th>{t('attestations.table.department')}</th>}
                <th>{t('attestations.table.requestedAt')}</th>
                <th>{t('attestations.table.status')}</th>
                <th>{t('attestations.table.signature')}</th>
                <th>{t('attestations.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>{t('attestations.table.noData')}</td></tr>
              ) : paginated.map(doc => {
                const cfg = statusConfig[doc.statut] || statusConfig['EN_ATTENTE'];
                return (
                  <tr key={doc.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8rem' }}>{doc.id}</span></td>
                    <td><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doc.type}</span></td>
                    {!isEmployee && <td>{doc.employee}</td>}
                    {!isEmployee && <td><span className="filter-tag blue">{doc.dept}</span></td>}
                    <td>{doc.requestedAt}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg, whiteSpace: 'nowrap' }}>
                        <i className={cfg.icon}></i> {cfg.label || doc.statut}
                      </span>
                    </td>
                    <td>
                      {doc.signedBy
                        ? <span style={{ fontSize: '0.75rem', color: '#BE185D', fontWeight: 600 }}><i className="fas fa-pen-fancy"></i> {doc.signedBy}</span>
                        : <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{t('attestations.table.noSignature')}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {doc.statut === 'SIGNEE' && (
                          <button onClick={() => generatePDF(doc)}
                            style={{ background: '#ECFDF5', color: '#10B981', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                            <i className="fas fa-download"></i>
                          </button>
                        )}
                        {isHR && doc.statut === 'EN_ATTENTE' && (
                          <button onClick={async () => { try { await api.put(`/attestations/${doc.rawId}/generate`); showToast(t('attestations.toast.processed'), 'success'); fetchAttestations(); } catch(e) { showToast('Erreur de validation', 'error'); } }}
                            style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                            <i className="fas fa-check"></i>
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

      {/* Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={t('attestations.modal.requestTitle')}
        icon="fas fa-file-alt"
        iconColor="#7C3AED"
        iconBg="#F5F3FF"
        submitColor="#7C3AED"
        onSubmit={handleRequest}
        submitText={t('attestations.modal.submit')}
        isSubmitDisabled={!form.type}
      >
        <form onSubmit={e => { e.preventDefault(); handleRequest(); }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-file-signature" style={{ color: '#7C3AED' }}></i> {t('attestations.modal.docType')} *
            </label>
            <select name="type" className="form-input" value={form.type} onChange={handleFormChange}>
              <option value="travail">Attestation de Travail</option>
              <option value="salaire">Attestation de Salaire</option>
              <option value="administratif">Bulletin de Paie</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-align-left" style={{ color: 'var(--text-gray)' }}></i> {t('attestations.modal.note')}
            </label>
            <textarea name="note" className="form-input" rows="3" placeholder={t('attestations.modal.notePlaceholder')} value={form.note} onChange={handleFormChange}></textarea>
          </div>
          <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#92400E', fontWeight: 500 }}>
            <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
            {t('attestations.modal.delay')}
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
