import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { User, Building2, Calendar, Fingerprint, FileText, Share2, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', requests: 40, absences: 24 },
  { name: 'Fév', requests: 30, absences: 13 },
  { name: 'Mar', requests: 20, absences: 58 },
  { name: 'Avr', requests: 27, absences: 39 },
  { name: 'Mai', requests: 18, absences: 48 },
  { name: 'Juin', requests: 23, absences: 38 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleRequestAction = (row) => {
    setSelectedRequest(row);
    setIsDetailsModalOpen(true);
  };

  // --- Employee Form State ---
  const [employeeForm, setEmployeeForm] = useState({ prenom: '', nom: '', email: '', poste: '', departement: 'Ingénierie' });
  const handleEmployeeChange = e => setEmployeeForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleEmployeeSubmit = () => {
    showToast('Employé ajouté avec succès !', 'success');
    setEmployeeForm({ prenom: '', nom: '', email: '', poste: '', departement: 'Ingénierie' });
    setIsEmployeeModalOpen(false);
  };

  // --- Request Form State (Manager) ---
  const [requestForm, setRequestForm] = useState({ type: 'Attestation de Travail', priorite: 'Normale (Délai 48h)', description: '', fichier: null });
  const handleRequestChange = e => setRequestForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRequestSubmit = () => {
    showToast('Votre demande a été soumise à l\'équipe RH.', 'info');
    setRequestForm({ type: 'Attestation de Travail', priorite: 'Normale (Délai 48h)', description: '', fichier: null });
    setIsRequestModalOpen(false);
  };

  // --- Leave Form State ---
  const [leaveForm, setLeaveForm] = useState({ employe: '', type: 'Congé Annuel', dateDebut: '', dateFin: '' });
  const handleLeaveChange = e => setLeaveForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLeaveSubmit = () => {
    showToast('Absence enregistrée dans le système.', 'success');
    setLeaveForm({ employe: '', type: 'Congé Annuel', dateDebut: '', dateFin: '' });
    setIsLeaveModalOpen(false);
  };

  // --- Dashboard Table Pagination ---
  const [dashboardPage, setDashboardPage] = useState(1);
  const DASHBOARD_TOTAL = 452;

  // If Employee, show simple dashboard
  if (user?.role === 'EMPLOYEE') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <header className="header">
          <div className="header-title">
            <h1>Mon Espace</h1>
            <p>Bienvenue {user.name}, voici le résumé de vos activités.</p>
          </div>
          <div className="header-actions">
            <button className="action-btn primary" onClick={() => setIsRequestModalOpen(true)}>
              <i className="fas fa-plus"></i> Nouvelle Demande
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon primary"><i className="fas fa-calendar"></i></div>
            </div>
            <div className="stat-value">18 Jours</div>
            <div className="stat-label">Solde de congés restants</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon warning"><i className="fas fa-clock"></i></div>
            </div>
            <div className="stat-value">2</div>
            <div className="stat-label">Demandes en attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon success"><i className="fas fa-check"></i></div>
            </div>
            <div className="stat-value">4</div>
            <div className="stat-label">Demandes approuvées</div>
          </div>
        </div>

        <Modal 
          isOpen={isRequestModalOpen} 
          onClose={() => setIsRequestModalOpen(false)} 
          title="Nouvelle Demande"
          icon="fas fa-file-alt"
          iconColor="var(--c-purple)"
          iconBg="var(--bg-purple)"
          submitColor="var(--c-purple)"
          onSubmit={handleRequestSubmit}
          submitText="Soumettre la demande"
        >
          <form onSubmit={e => { e.preventDefault(); handleRequestSubmit(); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Type de demande</label>
                <select name="type" className="form-input" value={requestForm.type} onChange={handleRequestChange}>
                  <option>Attestation de Travail</option>
                  <option>Attestation de Salaire</option>
                  <option>Demande d'avance</option>
                  <option>Renouvellement de matériel</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">Priorité</label>
                <select name="priorite" className="form-input" value={requestForm.priorite} onChange={handleRequestChange}>
                  <option>Normale (Délai 48h)</option>
                  <option>Haute (Délai 24h)</option>
                  <option>Urgente (Immédiat)</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Description ou détails additionnels</label>
              <textarea name="description" className="form-input" rows="2" placeholder="Précisez la langue souhaitée, la période, ou toute information utile pour l'équipe RH..." value={requestForm.description} onChange={handleRequestChange}></textarea>
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Pièces jointes (Optionnel)</label>
              <div style={{ border: '2px dashed var(--border-color)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => document.getElementById('fileInputEmployee').click()}>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--primary)' }}></i>
                <div style={{ fontSize: '0.85rem' }}>{requestForm.fichier ? requestForm.fichier.name : 'Cliquez pour ajouter un fichier (PDF, JPG, PNG)'}</div>
                <input id="fileInputEmployee" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setRequestForm(p => ({ ...p, fichier: e.target.files[0] }))} />
              </div>
            </div>
          </form>
        </Modal>

        {/* Employee Modal (shown inside Employee view) */}
        <Modal 
          isOpen={isEmployeeModalOpen} 
          onClose={() => setIsEmployeeModalOpen(false)} 
          title="Ajouter un employé"
          icon="fas fa-user-plus"
          iconColor="var(--c-blue)"
          iconBg="var(--bg-blue)"
          submitColor="var(--c-blue)"
          onSubmit={handleEmployeeSubmit}
          submitText="Ajouter l'employé"
        >
          <form onSubmit={e => { e.preventDefault(); handleEmployeeSubmit(); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prénom</label>
                <input type="text" name="prenom" className="form-input" placeholder="Ex: Jean" value={employeeForm.prenom} onChange={handleEmployeeChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom</label>
                <input type="text" name="nom" className="form-input" placeholder="Ex: Dupont" value={employeeForm.nom} onChange={handleEmployeeChange} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Adresse Email</label>
              <input type="email" name="email" className="form-input" placeholder="jean.dupont@entreprise.com" value={employeeForm.email} onChange={handleEmployeeChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Poste</label>
                <input type="text" name="poste" className="form-input" placeholder="Développeur Front-end" value={employeeForm.poste} onChange={handleEmployeeChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Département</label>
                <select name="departement" className="form-input" value={employeeForm.departement} onChange={handleEmployeeChange}>
                  <option>Ingénierie</option>
                  <option>Marketing</option>
                  <option>Ventes</option>
                  <option>Ressources Humaines</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Leave Modal */}
        <Modal 
          isOpen={isLeaveModalOpen} 
          onClose={() => setIsLeaveModalOpen(false)} 
          title="Enregistrer une Absence"
          icon="fas fa-calendar-alt"
          iconColor="var(--c-orange)"
          iconBg="var(--bg-orange)"
          submitColor="var(--c-orange)"
          onSubmit={handleLeaveSubmit}
          submitText="Enregistrer l'absence"
        >
          <form onSubmit={e => { e.preventDefault(); handleLeaveSubmit(); }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Employé</label>
              <select name="employe" className="form-input" value={leaveForm.employe} onChange={handleLeaveChange} required>
                <option value="">Sélectionnez un employé...</option>
                <option value="john-davis">John Davis (Opérations)</option>
                <option value="maria-chen">Maria Chen (Conformité)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Type de congé</label>
              <select name="type" className="form-input" value={leaveForm.type} onChange={handleLeaveChange}>
                <option>Congé Annuel</option>
                <option>Congé Maladie</option>
                <option>Télétravail Exceptionnel</option>
                <option>Absence Non Justifiée</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date de début</label>
                <input type="date" name="dateDebut" className="form-input" value={leaveForm.dateDebut} onChange={handleLeaveChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date de fin</label>
                <input type="date" name="dateFin" className="form-input" value={leaveForm.dateFin} onChange={handleLeaveChange} required />
              </div>
            </div>
          </form>
        </Modal>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <h1>Aperçu RH ({user?.role === 'HR_MANAGER' ? 'Manager RH' : 'Chef de Dép.'})</h1>
          <p>Gérez et suivez tous vos employés et demandes RH</p>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-trend positive"><i className="fas fa-arrow-up"></i> +12%</div>
          </div>
          <div className="stat-value">452</div>
          <div className="stat-label">Employés Actifs</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon warning"><i className="fas fa-clock"></i></div>
            <div className="stat-trend negative"><i className="fas fa-circle" style={{ fontSize: '8px' }}></i> Urgent</div>
          </div>
          <div className="stat-value">18</div>
          <div className="stat-label">En Attente de Validation</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success"><i className="fas fa-calendar-check"></i></div>
            <div className="stat-trend positive"><i className="fas fa-check"></i> À jour</div>
          </div>
          <div className="stat-value">8</div>
          <div className="stat-label">En Congé Aujourd'hui</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#ECFCCB', color: '#65A30D' }}><i className="fas fa-shield-alt"></i></div>
            <div className="stat-trend positive" style={{ color: 'var(--success)' }}>Optimal</div>
          </div>
          <div className="stat-value">87%</div>
          <div className="stat-label">Taux de Conformité</div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="middle-grid">
        {/* Department Quotas (Like Compliance Progress) */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-check-circle" style={{ color: 'var(--success)' }}></i>
            Budgets par Département
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span>Ingénierie</span>
              <span style={{ color: 'var(--success)' }}>92%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '92%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Marketing</span>
              <span style={{ color: 'var(--success)' }}>88%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '88%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Ventes</span>
              <span style={{ color: 'var(--warning)' }}>75%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '75%', backgroundColor: 'var(--warning)' }}></div>
            </div>
          </div>

          <div className="progress-item" style={{ marginBottom: 0 }}>
            <div className="progress-header">
              <span>Ressources Humaines</span>
              <span style={{ color: 'var(--success)' }}>95%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '95%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-title">
            <i className="far fa-clock" style={{ color: 'var(--primary)' }}></i>
            Activité Récente
          </div>
          
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                <i className="fas fa-arrow-up"></i>
              </div>
              <div className="timeline-content">
                <h4>Nouvelle demande soumise</h4>
                <p>Attestation de salaire • il y a 2h</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon" style={{ background: '#DCFCE7', color: 'var(--success)' }}>
                <i className="fas fa-check"></i>
              </div>
              <div className="timeline-content">
                <h4>Congé approuvé</h4>
                <p>Congé annuel par Sarah M. • il y a 4h</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
                <i className="fas fa-sync"></i>
              </div>
              <div className="timeline-content">
                <h4>Mise à jour de la politique</h4>
                <p>Politique RH v2.0 publiée • il y a 6h</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-bolt" style={{ color: 'var(--primary)' }}></i>
            Actions Rapides
          </div>
          
          <button className="quick-action-btn action-blue" onClick={() => setIsEmployeeModalOpen(true)}>
            <i className="fas fa-user-plus"></i> Ajouter un employé
          </button>
          <button className="quick-action-btn action-purple" onClick={() => setIsRequestModalOpen(true)}>
            <i className="fas fa-file-alt"></i> Créer une demande
          </button>
          <button className="quick-action-btn action-orange" onClick={() => setIsLeaveModalOpen(true)}>
            <i className="fas fa-calendar-check"></i> Gérer les congés
          </button>
          <button className="quick-action-btn primary" style={{ marginTop: '8px' }}>
            <i className="fas fa-download"></i> Générer rapport de paie
          </button>
        </div>

        {/* Analytics Chart using Recharts */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">
            <i className="fas fa-chart-area" style={{ color: 'var(--primary)' }}></i>
            Évolution des Demandes et Absences
          </div>
          <div style={{ height: '220px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-gray)" />
                <YAxis stroke="var(--text-gray)" />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="requests" name="Demandes" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRequests)" />
                <Area type="monotone" dataKey="absences" name="Absences" stroke="var(--warning)" fillOpacity={1} fill="url(#colorAbsences)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">Demandes Récentes</h3>
          <div className="filter-group">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
            <button className="filter-pill filter-pill-blue">Dép: Ingénierie</button>
            <button className="filter-pill filter-pill-green">Statut: Actif</button>
            <button className="filter-pill filter-pill-purple">Type: Demande</button>
          </div>
        </div>

        <div className="table-container table-responsive">
          <table>
            <thead>
              <tr>
                <th>Demande</th>
                <th>Département</th>
                <th>Propriétaire</th>
                <th>Statut</th>
                <th>Mise à jour</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { icon: 'fa-file-invoice', iconBg: '#DBEAFE', iconColor: '#2563EB', title: "Attestation de Salaire", sub: 'PDF • Demande', dept: 'Finance', initials: 'SM', avatarBg: '#2563EB', owner: 'Sarah Miller', status: 'Approuvé', statusBg: '#DCFCE7', statusColor: '#16A34A', date: '10 Nov, 2026' },
                { icon: 'fa-plane-departure', iconBg: '#ECFCCB', iconColor: '#65A30D', title: "Congé Annuel", sub: '14 Jours • Formulaire', dept: 'Opérations', initials: 'JD', avatarBg: '#0D9488', owner: 'John Davis', status: 'En Attente', statusBg: '#FEF3C7', statusColor: '#D97706', date: '12 Nov, 2026' },
                { icon: 'fa-briefcase-medical', iconBg: '#F3E8FF', iconColor: '#9333EA', title: "Certificat de Maladie", sub: 'Médical • PDF', dept: 'RH', initials: 'AK', avatarBg: '#9333EA', owner: 'Alex Kim', status: 'Approuvé', statusBg: '#DCFCE7', statusColor: '#16A34A', date: '08 Nov, 2026' },
                { icon: 'fa-shield-alt', iconBg: '#CCFBF1', iconColor: '#0D9488', title: "Checklist Conformité 2026", sub: 'v1.5 • XLSX', dept: 'Conformité', initials: 'MC', avatarBg: '#10B981', owner: 'Maria Chen', status: 'En Révision', statusBg: '#FEF3C7', statusColor: '#D97706', date: '11 Nov, 2026' },
              ].map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <div className="icon-box" style={{ background: row.iconBg, color: row.iconColor }}>
                        <i className={`fas ${row.icon}`}></i>
                      </div>
                      <div>
                        <span className="user-info-name">{row.title}</span>
                        <span className="user-info-sub">{row.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="dept-pill" style={{ background: '#EFF6FF', color: '#2563EB' }}>{row.dept}</span></td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-initials" style={{ background: row.avatarBg }}>{row.initials}</div>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{row.owner}</span>
                    </div>
                  </td>
                  <td><span className={`modern-status-badge ${row.status === 'Approuvé' ? 'badge-success' : row.status === 'En Attente' ? 'badge-warning' : 'badge-info'}`}>{row.status}</span></td>
                  <td style={{ color: '#64748B', fontSize: '0.9rem' }}>{row.date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button className="modern-action-btn" onClick={() => handleRequestAction(row)}><i className="far fa-eye"></i></button>
                      <button className="modern-action-btn" onClick={() => showToast('Téléchargement du document...', 'info')}><i className="fas fa-download"></i></button>
                      <button className="modern-action-btn" onClick={() => showToast('Lien de partage copié !', 'success')}><i className="fas fa-share-alt"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={dashboardPage}
          totalItems={DASHBOARD_TOTAL}
          itemsPerPage={4}
          onPageChange={setDashboardPage}
        />
      </div>

      {/* Employee Modal */}
      <Modal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => setIsEmployeeModalOpen(false)} 
        title="Ajouter un employé"
        icon="fas fa-user-plus"
        iconColor="var(--c-blue)"
        iconBg="var(--bg-blue)"
        submitColor="var(--c-blue)"
        onSubmit={handleEmployeeSubmit}
        submitText="Ajouter l'employé"
      >
        <form onSubmit={e => { e.preventDefault(); handleEmployeeSubmit(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prénom</label>
              <input type="text" name="prenom" className="form-input" placeholder="Ex: Jean" value={employeeForm.prenom} onChange={handleEmployeeChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nom</label>
              <input type="text" name="nom" className="form-input" placeholder="Ex: Dupont" value={employeeForm.nom} onChange={handleEmployeeChange} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Adresse Email</label>
            <input type="email" name="email" className="form-input" placeholder="jean.dupont@entreprise.com" value={employeeForm.email} onChange={handleEmployeeChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Poste</label>
              <input type="text" name="poste" className="form-input" placeholder="Développeur Front-end" value={employeeForm.poste} onChange={handleEmployeeChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Département</label>
              <select name="departement" className="form-input" value={employeeForm.departement} onChange={handleEmployeeChange}>
                <option>Ingénierie</option>
                <option>Marketing</option>
                <option>Ventes</option>
                <option>Ressources Humaines</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        title="Nouvelle Demande"
        icon="fas fa-file-alt"
        iconColor="var(--c-purple)"
        iconBg="var(--bg-purple)"
        submitColor="var(--c-purple)"
        onSubmit={handleRequestSubmit}
        submitText="Soumettre la demande"
      >
        <form onSubmit={e => { e.preventDefault(); handleRequestSubmit(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Type de demande</label>
              <select name="type" className="form-input" value={requestForm.type} onChange={handleRequestChange}>
                <option>Attestation de Travail</option>
                <option>Attestation de Salaire</option>
                <option>Demande d'avance</option>
                <option>Renouvellement de matériel</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Priorité</label>
              <select name="priorite" className="form-input" value={requestForm.priorite} onChange={handleRequestChange}>
                <option>Normale (Délai 48h)</option>
                <option>Haute (Délai 24h)</option>
                <option>Urgente (Immédiat)</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Description ou détails additionnels</label>
            <textarea name="description" className="form-input" rows="2" placeholder="Précisez la langue souhaitée, la période, ou toute information utile pour l'équipe RH..." value={requestForm.description} onChange={handleRequestChange}></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Pièces jointes (Optionnel)</label>
            <div style={{ border: '2px dashed var(--border-color)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => document.getElementById('fileInputDashboard').click()}>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--primary)' }}></i>
              <div style={{ fontSize: '0.85rem' }}>{requestForm.fichier ? requestForm.fichier.name : 'Cliquez pour ajouter un fichier (PDF, JPG, PNG)'}</div>
              <input id="fileInputDashboard" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setRequestForm(p => ({ ...p, fichier: e.target.files[0] }))} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Leave Modal */}
      <Modal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        title="Enregistrer une Absence"
        icon="fas fa-calendar-alt"
        iconColor="var(--c-orange)"
        iconBg="var(--bg-orange)"
        submitColor="var(--c-orange)"
        onSubmit={handleLeaveSubmit}
        submitText="Enregistrer l'absence"
      >
        <form onSubmit={e => { e.preventDefault(); handleLeaveSubmit(); }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Employé</label>
            <select name="employe" className="form-input" value={leaveForm.employe} onChange={handleLeaveChange} required>
              <option value="">Sélectionnez un employé...</option>
              <option value="john-davis">John Davis (Opérations)</option>
              <option value="maria-chen">Maria Chen (Conformité)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Type de congé</label>
            <select name="type" className="form-input" value={leaveForm.type} onChange={handleLeaveChange}>
              <option>Congé Annuel</option>
              <option>Congé Maladie</option>
              <option>Télétravail Exceptionnel</option>
              <option>Absence Non Justifiée</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date de début</label>
              <input type="date" name="dateDebut" className="form-input" value={leaveForm.dateDebut} onChange={handleLeaveChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date de fin</label>
              <input type="date" name="dateFin" className="form-input" value={leaveForm.dateFin} onChange={handleLeaveChange} required />
            </div>
          </div>
        </form>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Détails de la Demande"
        icon="far fa-file-alt"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        {selectedRequest && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>{selectedRequest.title}</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                      backgroundColor: '#2563EB', 
                      color: '#ffffff', 
                      padding: '3px 10px', 
                      borderRadius: '4px', 
                      fontSize: '0.65rem', 
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '60px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {selectedRequest.type || 'DOCUMENT'}
                    </span>
                    <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500 }}>
                      Ref: <span style={{ color: 'var(--text-dark)' }}>#RQ-{selectedRequest.id * 1234 || 5843}</span>
                    </span>
                  </div>
                </div>
              </div>
              <span className={`modern-status-badge ${selectedRequest.status === 'Approuvé' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 16px', fontSize: '0.75rem' }}>{selectedRequest.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div className="detail-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <User size={14} color="var(--primary)" />
                  <span className="detail-label">Propriétaire</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedRequest.avatarBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, border: '2px solid var(--main-bg)' }}>{selectedRequest.initials}</div>
                  <span className="detail-value" style={{ fontSize: '0.9rem' }}>{selectedRequest.owner}</span>
                </div>
              </div>

              <div className="detail-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={14} color="var(--c-purple)" />
                  <span className="detail-label">Département</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.9rem' }}>{selectedRequest.dept}</span>
              </div>

              <div className="detail-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Calendar size={14} color="var(--c-orange)" />
                  <span className="detail-label">Mise à jour</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.9rem' }}>{selectedRequest.date}</span>
              </div>

              <div className="detail-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Fingerprint size={14} color="var(--text-gray)" />
                  <span className="detail-label">ID Traçabilité</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>#RH-{selectedRequest.id || 7130}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="action-btn primary" style={{ flex: 1, justifyContent: 'center', gap: '10px', height: '44px' }} onClick={() => { showToast('Traitement de la demande...', 'info'); setIsDetailsModalOpen(false); }}>
                <Share2 size={18} /> Actions Rapides
              </button>
              <button className="action-btn" style={{ flex: 1, justifyContent: 'center', height: '44px' }} onClick={() => setIsDetailsModalOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

    </motion.div>
  );
};

export default Dashboard;
