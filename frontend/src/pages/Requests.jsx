import React, { useState } from 'react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { FileText, Clock, AlertTriangle, CheckCircle2, User, Building2, Calendar } from 'lucide-react';

const Requests = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('attente');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // --- New Request Form State ---
  const [newRequestForm, setNewRequestForm] = useState({ type: 'Attestation de Travail', priorite: 'Normale (Délai 48h)', description: '', fichier: null });
  const handleNewRequestChange = e => setNewRequestForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleNewRequestSubmit = () => {
    showToast('Votre demande a été soumise avec succès.', 'success');
    setNewRequestForm({ type: 'Attestation de Travail', priorite: 'Normale (Délai 48h)', description: '', fichier: null });
    setIsModalOpen(false);
  };

  const onApprove = () => {
    showToast('La demande a été approuvée.', 'success');
    setIsDetailsModalOpen(false);
  };

  const onReject = () => {
    showToast('La demande a été rejetée.', 'error');
    setIsDetailsModalOpen(false);
  };

  // --- Pagination state per tab ---
  const [pageAttente, setPageAttente] = useState(1);
  const [pageCours, setPageCours] = useState(1);
  const [pageTerminees, setPageTerminees] = useState(1);
  const TOTAL_ATTENTE   = 18;
  const TOTAL_COURS     = 5;
  const TOTAL_TERMINEES = 142;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1>Gestion des Demandes RH</h1>
          <p>Approuvez, rejetez et gérez les demandes administratives des employés</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Nouvelle Demande
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <div 
          onClick={() => setActiveTab('attente')}
          style={{ fontWeight: activeTab === 'attente' ? 600 : 500, color: activeTab === 'attente' ? 'var(--primary)' : 'var(--text-gray)', borderBottom: activeTab === 'attente' ? '2px solid var(--primary)' : 'none', paddingBottom: '12px', marginBottom: activeTab === 'attente' ? '-1px' : '0', cursor: 'pointer', transition: 'all 0.2s' }}>En Attente (18)</div>
        <div 
          onClick={() => setActiveTab('cours')}
          style={{ fontWeight: activeTab === 'cours' ? 600 : 500, color: activeTab === 'cours' ? 'var(--primary)' : 'var(--text-gray)', borderBottom: activeTab === 'cours' ? '2px solid var(--primary)' : 'none', paddingBottom: '12px', marginBottom: activeTab === 'cours' ? '-1px' : '0', cursor: 'pointer', transition: 'all 0.2s' }}>En Cours (5)</div>
        <div 
          onClick={() => setActiveTab('terminees')}
          style={{ fontWeight: activeTab === 'terminees' ? 600 : 500, color: activeTab === 'terminees' ? 'var(--primary)' : 'var(--text-gray)', borderBottom: activeTab === 'terminees' ? '2px solid var(--primary)' : 'none', paddingBottom: '12px', marginBottom: activeTab === 'terminees' ? '-1px' : '0', cursor: 'pointer', transition: 'all 0.2s' }}>Terminées (142)</div>
        <div 
          onClick={() => setActiveTab('rejetees')}
          style={{ fontWeight: activeTab === 'rejetees' ? 600 : 500, color: activeTab === 'rejetees' ? 'var(--primary)' : 'var(--text-gray)', borderBottom: activeTab === 'rejetees' ? '2px solid var(--primary)' : 'none', paddingBottom: '12px', marginBottom: activeTab === 'rejetees' ? '-1px' : '0', cursor: 'pointer', transition: 'all 0.2s' }}>Rejetées (12)</div>
      </div>

      <div className="card glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', marginBottom: 0 }}>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Rechercher une demande..." />
          </div>
        </div>

        {activeTab === 'attente' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Demande</th>
                  <th>Département</th>
                  <th>Propriétaire</th>
                  <th>Soumission</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}>
                        <i className="fas fa-file-invoice"></i>
                      </div>
                      <div>
                        <span className="user-info-name">Attestation de Salaire</span>
                        <span className="user-info-sub">PDF • Demande urgente</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="dept-pill" style={{ background: '#EFF6FF', color: '#2563EB' }}>Opérations</span></td>
                  <td>
                    <div className="user-cell">
                      <img src="https://ui-avatars.com/api/?name=John+Davis&background=0D9488&color=fff" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.85rem' }}>John Davis</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Il y a 2h</td>

                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button onClick={() => setIsDetailsModalOpen(true)} className="modern-action-btn" title="Voir les détails"><i className="far fa-eye"></i></button>
                      <button className="modern-action-btn" title="Approuver"><i className="fas fa-check"></i></button>
                      <button className="modern-action-btn" title="Rejeter"><i className="fas fa-times"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="icon-box" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                        <i className="fas fa-file-contract"></i>
                      </div>
                      <div>
                        <span className="user-info-name">Attestation de Travail</span>
                        <span className="user-info-sub">Document RH</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="dept-pill" style={{ background: '#CCFBF1', color: '#0D9488' }}>Conformité</span></td>
                  <td>
                    <div className="user-cell">
                      <img src="https://ui-avatars.com/api/?name=Maria+Chen&background=10B981&color=fff" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.85rem' }}>Maria Chen</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Il y a 5h</td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => setIsDetailsModalOpen(true)} className="modern-action-btn" title="Voir les détails"><i className="far fa-eye"></i></button>
                      <button className="modern-action-btn" title="Approuver"><i className="fas fa-check"></i></button>
                      <button className="modern-action-btn" title="Rejeter"><i className="fas fa-times"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination
              currentPage={pageAttente}
              totalItems={TOTAL_ATTENTE}
              itemsPerPage={5}
              onPageChange={setPageAttente}
            />
          </div>
        )}

        {activeTab === 'cours' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Demande</th>
                  <th>Propriétaire</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
                        <i className="fas fa-laptop-code"></i>
                      </div>
                      <div>
                        <span className="user-info-name">Renouvellement Matériel</span>
                        <span className="user-info-sub">Équipement IT</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <img src="https://ui-avatars.com/api/?name=Lucas+Martin&background=F59E0B&color=fff" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.85rem' }}>Lucas Martin</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.85rem' }}>

                      <i className="fas fa-spinner fa-spin" style={{ color: '#D97706' }}></i> Traitement manager
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => setIsDetailsModalOpen(true)} className="modern-action-btn" title="Voir les détails"><i className="far fa-eye"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination
              currentPage={pageCours}
              totalItems={TOTAL_COURS}
              itemsPerPage={5}
              onPageChange={setPageCours}
            />
          </div>
        )}

        {activeTab === 'terminees' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Demande</th>
                  <th>Propriétaire</th>
                  <th>Clôture</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div>
                        <span className="user-info-name">Attestation de Travail</span>
                        <span className="user-info-sub">Clôturé avec succès</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <img src="https://ui-avatars.com/api/?name=Emma+Wilson&background=2563EB&color=fff" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.85rem' }}>Emma Wilson</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.85rem' }}>

                      <i className="fas fa-check-circle" style={{ color: '#16A34A' }}></i> Hier
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => setIsDetailsModalOpen(true)} className="modern-action-btn" title="Voir les détails"><i className="far fa-eye"></i></button>
                      <button className="modern-action-btn" title="Télécharger copie"><i className="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination
              currentPage={pageTerminees}
              totalItems={TOTAL_TERMINEES}
              itemsPerPage={5}
              onPageChange={setPageTerminees}
            />
          </div>
        )}

        {activeTab === 'rejetees' && (
          <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--sidebar-bg)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-blue)', color: 'var(--c-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px' }}>
              <i className="fas fa-inbox"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '600' }}>Aucune demande rejetée</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 24px' }}>Toutes les demandes traitées récemment ont été approuvées ou sont encore en cours d'examen.</p>
            <button className="action-btn" onClick={() => setActiveTab('attente')} style={{ margin: '0 auto' }}>
              <i className="fas fa-arrow-left"></i> Retour aux demandes en attente
            </button>
          </div>
        )}
      </div>
       <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Créer une Demande RH"
        icon="fas fa-file-signature"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        <form onSubmit={e => { e.preventDefault(); handleNewRequestSubmit(); }} style={{ padding: '4px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={12} color="var(--primary)" /> Type
              </label>
              <select name="type" className="form-input" value={newRequestForm.type} onChange={handleNewRequestChange}>
                <option>Attestation de Travail</option>
                <option>Attestation de Salaire</option>
                <option>Demande d'avance</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} color="var(--warning)" /> Priorité
              </label>
              <select name="priorite" className="form-input" value={newRequestForm.priorite} onChange={handleNewRequestChange}>
                <option>Normale</option>
                <option>Haute</option>
                <option>Urgente</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.7rem' }}>Description</label>
            <textarea name="description" className="form-input" rows="2" style={{ minHeight: '60px' }} placeholder="Détails du besoin..." value={newRequestForm.description} onChange={handleNewRequestChange}></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div style={{ border: '1px dashed var(--border-color)', padding: '12px', textAlign: 'center', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sidebar-bg)' }} onClick={() => document.getElementById('fileInputRequests').click()}>
              <Download size={16} color="var(--primary)" style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{newRequestForm.fichier ? newRequestForm.fichier.name : 'Ajouter un document (PDF, Image)'}</div>
              <input id="fileInputRequests" type="file" style={{ display: 'none' }} onChange={e => setNewRequestForm(p => ({ ...p, fichier: e.target.files[0] }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="action-btn primary" style={{ flex: 2, height: '42px' }}>
              Soumettre la demande
            </button>
            <button type="button" className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title="Détails de la demande"
        icon="far fa-eye"
        iconColor="var(--c-blue)"
        iconBg="var(--bg-blue)"
        showFooter={false}
      >
        {/* We use a custom footer inside the content for better design control */}
        <div style={{ padding: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>Attestation de Travail</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="filter-tag blue" style={{ padding: '2px 10px', fontSize: '0.7rem' }}>RH DOCUMENT</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Ref: #RQ-8842</span>
                </div>
              </div>
            </div>
            <span className="modern-status-badge badge-warning" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>En Attente</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div className="detail-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <User size={14} color="var(--primary)" />
                <span className="detail-label">Demandeur</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>JD</div>
                <span className="detail-value" style={{ fontSize: '0.9rem' }}>John Davis</span>
              </div>
            </div>

            <div className="detail-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertTriangle size={14} color="var(--c-orange)" />
                <span className="detail-label">Priorité</span>
              </div>
              <span className="detail-value" style={{ fontSize: '0.9rem', color: 'var(--warning)' }}>Haute (Urgent)</span>
            </div>

            <div className="detail-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Calendar size={14} color="var(--success)" />
                <span className="detail-label">Date Soumise</span>
              </div>
              <span className="detail-value" style={{ fontSize: '0.9rem' }}>14 Nov 2026</span>
            </div>

            <div className="detail-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={14} color="var(--text-gray)" />
                <span className="detail-label">Délai Estimé</span>
              </div>
              <span className="detail-value" style={{ fontSize: '0.9rem' }}>24 Heures</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button className="action-btn" onClick={onReject} style={{ flex: 1, justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger-bg)', backgroundColor: 'var(--danger-bg)', height: '44px' }}>
              <i className="fas fa-times"></i> Rejeter
            </button>
            <button className="action-btn primary" onClick={onApprove} style={{ flex: 2, justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)', height: '44px' }}>
              <CheckCircle2 size={18} style={{ marginRight: '8px' }} /> Approuver la demande
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Requests;
