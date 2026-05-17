import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { logSystemActivity } from '../utils/rbac';
import { Calendar, Clock, Umbrella, HeartPulse, User, MapPin, CheckCircle2, X } from 'lucide-react';

const LeaveManagement = () => {
  const { showToast } = useToast();
  const { user, effectiveRole } = useAuth();
  
  const isEmployee = effectiveRole === 'EMPLOYEE';
  const isDeptManager = effectiveRole === 'DEPARTMENT_MANAGER' || effectiveRole === 'INTERIM_MANAGER';
  const isHR = effectiveRole === 'HR_MANAGER' || effectiveRole === 'HR_AGENT';

  const defaultAbsences = [
    { id: 1, name: "Emma Wilson", dept: "Dép. Ventes", type: "Congé Annuel", period: "15 Oct - 20 Oct", duration: "5 jours", status: "Approuvé", initials: "EW", bg: "#2563EB" },
    { id: 2, name: "David Chen", dept: "Ingénierie", type: "Maladie", period: "01 Nov - 03 Nov", duration: "3 jours", status: "Approuvé", initials: "DC", bg: "#10B981" },
    { id: 3, name: "Steve Jobs", dept: "Marketing", type: "Congé Annuel", period: "20 Déc - 02 Jan", duration: "14 jours", status: "En attente", initials: "SJ", bg: "#F59E0B" },
    { id: 4, name: "Alex Kim", dept: "Finance", type: "Maladie", period: "13 Nov - 14 Nov", duration: "2 jours", status: "En attente", initials: "AK", bg: "#9333EA" },
    { id: 5, name: "Ali Benali", dept: "Ingénierie", type: "Congé Annuel", period: "10 Déc - 12 Déc", duration: "2 jours", status: "En attente", initials: "AB", bg: "#059669" }
  ];

  const [absences, setAbsences] = useState(() => {
    try {
      const saved = localStorage.getItem('system_leaves');
      return saved ? JSON.parse(saved) : defaultAbsences;
    } catch (e) {
      return defaultAbsences;
    }
  });

  useEffect(() => {
    localStorage.setItem('system_leaves', JSON.stringify(absences));
  }, [absences]);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  // New leave form state
  const [leaveForm, setLeaveForm] = useState({ type: 'Congé Annuel', start: '', end: '', motif: '' });

  const filteredAbsences = absences.filter(abs => {
    if (isEmployee) return abs.name === user?.name;
    if (isDeptManager) {
      const uDept = user?.dept?.toLowerCase() || '';
      return abs.dept.toLowerCase().includes(uDept) || uDept.includes(abs.dept.toLowerCase()) || abs.name === user?.name;
    }
    return true; // HR sees everything
  });

  const pendingRequests = filteredAbsences.filter(abs => abs.status === 'En attente' && abs.name !== user?.name);

  const handleAction = (type, absence) => {
    setSelectedAbsence(absence);
    if (type === 'view') setIsViewModalOpen(true);
    if (type === 'edit') setIsEditModalOpen(true);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "1 jour";
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const onLeaveSubmit = (e) => {
    e.preventDefault();
    const newAbsence = {
      id: Date.now(),
      name: user?.name || "Utilisateur",
      dept: user?.dept || "Général",
      type: leaveForm.type,
      period: `${formatDateShort(leaveForm.start)} - ${formatDateShort(leaveForm.end)}`,
      duration: calculateDuration(leaveForm.start, leaveForm.end),
      status: "En attente",
      initials: (user?.name || "Utilisateur").split(' ').map(n=>n[0]).join(''),
      bg: "#2563EB"
    };

    setAbsences(prev => [newAbsence, ...prev]);
    showToast('Demande de congé enregistrée avec succès !', 'success');
    logSystemActivity("Demande Congé", user?.name, `Demande de congé: ${newAbsence.duration} (${newAbsence.type})`);
    setLeaveForm({ type: 'Congé Annuel', start: '', end: '', motif: '' });
    setIsLeaveModalOpen(false);
  };

  const onApprove = (id, e) => {
    if(e) e.stopPropagation();
    setAbsences(prev => prev.map(abs => abs.id === id ? { ...abs, status: 'Approuvé' } : abs));
    showToast(isDeptManager ? 'Congé validé par le département.' : 'Congé approuvé avec succès.', 'success');
    logSystemActivity("Approbation Congé", user?.name, `Congé approuvé pour la demande #${id}`);
    setIsViewModalOpen(false);
  };

  const onReject = (id, e) => {
    if(e) e.stopPropagation();
    setAbsences(prev => prev.map(abs => abs.id === id ? { ...abs, status: 'Rejeté' } : abs));
    showToast('La demande de congé a été rejetée.', 'error');
    logSystemActivity("Rejet Congé", user?.name, `Congé rejeté pour la demande #${id}`);
    setIsViewModalOpen(false);
  };

  const onEditSubmit = () => {
    showToast('Absence mise à jour !', 'info');
    setIsEditModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1>{isEmployee ? "Mes Congés & Absences" : "Gestion des Congés"}</h1>
          <p>{isEmployee ? "Gérez vos jours de repos et consultez vos soldes." : "Suivez la disponibilité de l'équipe et gérez les demandes"}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setIsLeaveModalOpen(true)}>
            <i className="fas fa-calendar-plus"></i> {isEmployee ? "Demander un Congé" : "Enregistrer une Absence"}
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {isEmployee ? (
          <>
            <div className="stat-card blue-card">
              <div className="stat-header">
                <div className="stat-icon primary"><i className="fas fa-calendar-check"></i></div>
              </div>
              <div className="stat-value">18</div>
              <div className="stat-label">Jours Restants (Annuel)</div>
            </div>
            <div className="stat-card amber-card">
              <div className="stat-header">
                <div className="stat-icon warning"><i className="fas fa-hourglass-half"></i></div>
              </div>
              <div className="stat-value">{filteredAbsences.filter(a => a.status === 'En attente').length}</div>
              <div className="stat-label">Demandes en Attente</div>
            </div>
            <div className="stat-card emerald-card">
              <div className="stat-header">
                <div className="stat-icon success"><i className="fas fa-plane-departure"></i></div>
              </div>
              <div className="stat-value">12</div>
              <div className="stat-label">Jours Pris Cette Année</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card emerald-card">
              <div className="stat-header">
                <div className="stat-icon success"><i className="fas fa-umbrella-beach"></i></div>
              </div>
              <div className="stat-value">{filteredAbsences.filter(a => a.status === 'Approuvé' && a.type === 'Congé Annuel').length}</div>
              <div className="stat-label">En Congé Approuvé</div>
            </div>
            <div className="stat-card amber-card">
              <div className="stat-header">
                <div className="stat-icon warning"><i className="fas fa-hourglass-half"></i></div>
              </div>
              <div className="stat-value">{pendingRequests.length}</div>
              <div className="stat-label">Demandes en Attente</div>
            </div>
            <div className="stat-card purple-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}><i className="fas fa-briefcase-medical"></i></div>
              </div>
              <div className="stat-value">{filteredAbsences.filter(a => a.type === 'Maladie').length}</div>
              <div className="stat-label">Arrêts Maladie</div>
            </div>
          </>
        )}
      </div>

      {!isEmployee && (
        <div className="two-col-grid">
          {/* Calendar Preview Section */}
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Calendrier de l'Équipe (Novembre 2026)</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="action-btn" style={{ padding: '6px', border: 'none' }}><i className="fas fa-chevron-left"></i></button>
                <button className="action-btn" style={{ padding: '6px', border: 'none' }}><i className="fas fa-chevron-right"></i></button>
              </div>
            </div>
            {/* Mini Calendar Component */}
            <div style={{ padding: '16px 0', background: 'transparent' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div key={`${day}-${index}`} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-gray)', textAlign: 'center' }}>{day}</div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {Array(6).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
                
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const isToday = day === 16;
                  const hasAbsence = [3, 8, 12, 13, 20, 24].includes(day);
                  const isWeekend = (day + 6) % 7 === 6 || (day + 6) % 7 === 0;

                  return (
                    <div key={day} style={{ 
                      height: '32px',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'white' : (isWeekend ? 'var(--text-light)' : 'var(--text-dark)'),
                      background: isToday ? 'var(--primary)' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      {day}
                      {hasAbsence && !isToday && (
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '2px', 
                          width: '3px', 
                          height: '3px', 
                          borderRadius: '50%', 
                          background: day === 13 ? '#EF4444' : 'var(--primary)' 
                        }}></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', padding: '0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-gray)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                  Congé Approuvé
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-gray)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></div>
                  Alerte / Maladie
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests Column (Managers only) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>À Valider</h3>
              <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500 }}>{pendingRequests.length} attente(s)</span>
            </div>
            
            {pendingRequests.length > 0 ? pendingRequests.slice(0, 3).map(req => (
              <div key={req.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="avatar-sm" style={{ background: req.bg, width: '32px', height: '32px', color: '#fff' }}>{req.initials}</div>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{req.name}</span>
                  </div>
                  <span className={`filter-tag ${req.type === 'Maladie' ? 'purple' : 'blue'}`} style={req.type === 'Maladie' ? { background: '#FEE2E2', color: '#EF4444' } : {}}>{req.type}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                  {req.period} ({req.duration})
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="action-btn" onClick={() => onReject(req.id)} style={{ flex: 1, padding: '6px', justifyContent: 'center', color: 'var(--danger)' }}>Rejeter</button>
                  <button className="action-btn primary" onClick={() => onApprove(req.id)} style={{ flex: 1, padding: '6px', justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }}>Approuver</button>
                </div>
              </div>
            )) : (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)' }}>
                Aucune demande en attente pour le moment.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card glass-card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">
            <i className="fas fa-list" style={{ color: '#2563EB', marginRight: '10px' }}></i>
            {isEmployee ? "Historique de mes absences" : "Toutes les Absences"}
          </h3>
          <div className="filter-group">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>
        </div>

        <div className="table-container table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Période</th>
                <th>Durée</th>
                <th>Statut</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map((abs) => (
                <tr key={abs.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-initials" style={{ background: abs.bg }}>{abs.initials}</div>
                      <div>
                        <span className="user-info-name">{abs.name}</span>
                        <span className="user-info-sub">{abs.dept}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="dept-pill" style={{ background: abs.type === 'Maladie' ? '#FEE2E2' : '#EFF6FF', color: abs.type === 'Maladie' ? '#E11D48' : '#2563EB' }}>{abs.type}</span></td>
                  <td style={{ color: '#64748B', fontWeight: 500 }}>{abs.period}</td>
                  <td style={{ color: '#64748B' }}>{abs.duration}</td>
                  <td>
                    <span className={`modern-status-badge ${abs.status === 'Approuvé' ? 'badge-success' : abs.status === 'Rejeté' ? 'badge-danger' : 'badge-warning'}`}>
                      {abs.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button className="modern-action-btn" onClick={() => handleAction('view', abs)}><i className="far fa-eye"></i></button>
                      {(!isEmployee || abs.status === 'En attente') && (
                        <button className="modern-action-btn" onClick={() => handleAction('edit', abs)}><i className="far fa-edit"></i></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAbsences.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                    Aucun historique d'absence trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Absence Modal */}
      <Modal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        title={isEmployee ? "Demander un Congé" : "Enregistrer une Absence"}
        icon="fas fa-calendar-alt"
        iconColor="#2563EB"
        iconBg="#DBEAFE"
        submitColor="#2563EB"
        showFooter={false}
      >
        <form onSubmit={onLeaveSubmit} style={{ padding: '4px 0' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Type d'absence</label>
            <select className="form-input" required value={leaveForm.type} onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}>
              <option value="Congé Annuel">Congé Annuel</option>
              <option value="Maladie">Congé Maladie</option>
              <option value="Maternité / Paternité">Maternité / Paternité</option>
              {!isEmployee && <option value="Absence Non Justifiée">Absence Non Justifiée</option>}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date de début</label>
              <input type="date" required className="form-input" value={leaveForm.start} onChange={(e) => setLeaveForm({...leaveForm, start: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date de fin</label>
              <input type="date" required className="form-input" value={leaveForm.end} onChange={(e) => setLeaveForm({...leaveForm, end: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Motif / Justification</label>
            <textarea className="form-input" rows="2" placeholder="Raison de la demande..." value={leaveForm.motif} onChange={(e) => setLeaveForm({...leaveForm, motif: e.target.value})}></textarea>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="action-btn primary" style={{ flex: 2, height: '42px' }}>
              Soumettre
            </button>
            <button type="button" className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsLeaveModalOpen(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="Détails de l'Absence"
        icon="far fa-calendar-check"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        {selectedAbsence && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: selectedAbsence.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, margin: '0 auto 12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', border: '3px solid var(--main-bg)' }}>
                {selectedAbsence.initials}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>{selectedAbsence.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="filter-tag blue" style={{ padding: '2px 10px', fontSize: '0.65rem' }}>{selectedAbsence.dept}</span>
                <span className={`modern-status-badge ${selectedAbsence.status === 'Approuvé' ? 'badge-success' : selectedAbsence.status === 'Rejeté' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '2px 10px', fontSize: '0.65rem' }}>{selectedAbsence.status}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <div className="detail-box" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {selectedAbsence.type === 'Maladie' ? <HeartPulse size={12} color="var(--danger)" /> : <Umbrella size={12} color="var(--primary)" />}
                  <span className="detail-label" style={{ fontSize: '0.65rem' }}>Type de Congé</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.85rem' }}>{selectedAbsence.type}</span>
              </div>
              
              <div className="detail-box" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Clock size={12} color="var(--warning)" />
                  <span className="detail-label" style={{ fontSize: '0.65rem' }}>Durée Totale</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.85rem' }}>{selectedAbsence.duration}</span>
              </div>

              <div className="detail-box" style={{ gridColumn: 'span 2', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Calendar size={12} color="var(--success)" />
                  <span className="detail-label" style={{ fontSize: '0.65rem' }}>Période d'absence</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.85rem' }}>{selectedAbsence.period}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {(!isEmployee && selectedAbsence.status === 'En attente') ? (
                <>
                  <button className="action-btn" onClick={() => onReject(selectedAbsence.id)} style={{ flex: 1, justifyContent: 'center', height: '42px', color: 'var(--danger)', borderColor: 'var(--danger-bg)', backgroundColor: 'var(--danger-bg)' }}>
                    Rejeter
                  </button>
                  <button className="action-btn primary" onClick={() => onApprove(selectedAbsence.id)} style={{ flex: 2, justifyContent: 'center', height: '42px', background: 'var(--success)', borderColor: 'var(--success)' }}>
                    <CheckCircle2 size={16} style={{ marginRight: '6px' }} /> Approuver
                  </button>
                </>
              ) : (
                <button className="action-btn primary" style={{ flex: 1, justifyContent: 'center', height: '42px', fontSize: '0.85rem' }} onClick={() => setIsViewModalOpen(false)}>
                  Fermer
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Modifier l'Absence"
        icon="far fa-edit"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        {selectedAbsence && (
          <form style={{ padding: '4px 0' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Umbrella size={12} color="var(--primary)" /> Type d'absence
              </label>
              <select className="form-input" defaultValue={selectedAbsence.type}>
                <option>Congé Annuel</option>
                <option>Maladie</option>
                <option>Télétravail</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} color="var(--c-purple)" /> Période
              </label>
              <input type="text" className="form-input" defaultValue={selectedAbsence.period} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="action-btn primary" style={{ flex: 2, height: '42px' }} onClick={onEditSubmit}>Mettre à jour</button>
              <button type="button" className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsEditModalOpen(false)}>Annuler</button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default LeaveManagement;
