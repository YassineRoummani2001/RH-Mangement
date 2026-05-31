import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { logSystemActivity } from '../utils/rbac';
import { User, Mail, Briefcase, Building2, Calendar, Phone, ShieldCheck, AlertTriangle, Loader2, MapPin, Heart, FileText, DollarSign, CreditCard } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { TableRowSkeleton } from '../components/SkeletonLoader';

const Employees = () => {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user, effectiveRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states f Add Employee
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', role: '', dept: 'Ingénierie', contract: 'CDI', situationFamiliale: 'Célibataire', nombreEnfants: 0, telephone: '', cin: '', localisation: '', salaire: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', situationFamiliale: 'Célibataire', nombreEnfants: 0, telephone: '', cin: '', localisation: '', salaire: '' });

  // Evaluate RBAC permissions locally f the page
  const isHRManager = effectiveRole === 'HR_MANAGER';
  const isHRAgent = effectiveRole === 'HR_AGENT';
  const isDeptManager = effectiveRole === 'DEPARTMENT_MANAGER' || effectiveRole === 'INTERIM_MANAGER';

  const canCreate = isHRManager || isHRAgent;
  const canEdit = isHRManager || isHRAgent;
  const canDelete = isHRManager || isHRAgent;

  const handleAction = (type, employee) => {
    setSelectedEmployee(employee);
    if (type === 'view') setIsViewModalOpen(true);
    if (type === 'edit') {
      setEditForm({ 
        name: employee.name, 
        email: employee.email, 
        role: employee.role,
        situationFamiliale: employee.raw?.situationFamiliale || 'Célibataire',
        nombreEnfants: employee.raw?.nombreEnfants || 0,
        telephone: employee.raw?.telephone || '',
        cin: employee.raw?.cin || '',
        localisation: employee.raw?.localisation || '',
        salaire: employee.raw?.salaire || ''
      });
      setIsEditModalOpen(true);
    }
    if (type === 'delete') setIsDeleteModalOpen(true);
  };

  const onAddSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${addForm.firstName} ${addForm.lastName}`;
    try {
      const matchedService = services.find(s => s.nom.toLowerCase() === addForm.dept.toLowerCase());
      const serviceId = matchedService ? matchedService.id : null;

      await api.post('/employes', {
        prenom: addForm.firstName,
        nom: addForm.lastName,
        email: addForm.email,
        poste: addForm.role,
        statut: 'ACTIF',
        service_id: serviceId,
        situationFamiliale: addForm.situationFamiliale,
        nombreEnfants: parseInt(addForm.nombreEnfants) || 0,
        telephone: addForm.telephone,
        cin: addForm.cin,
        localisation: addForm.localisation,
        salaire: parseFloat(addForm.salaire) || 0
      });

      showToast(`Employé ${fullName} ajouté avec succès !`, 'success');
      logSystemActivity(
        "Création d'employé",
        user?.name,
        `Création du profil de l'employé: ${fullName} (${addForm.role}) dans le service ${addForm.dept}`
      );
      setIsAddModalOpen(false);
      setAddForm({ firstName: '', lastName: '', email: '', role: '', dept: 'Ingénierie', contract: 'CDI', situationFamiliale: 'Célibataire', nombreEnfants: 0, telephone: '', cin: '', localisation: '', salaire: '' });
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      const errMsg = error.response?.data?.message || 'Erreur lors de la création de l\'employé';
      showToast(errMsg, 'error');
    }
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const [firstName, ...lastNameArr] = editForm.name.trim().split(' ');
      const lastName = lastNameArr.join(' ') || ' ';

      await api.put(`/employes/${selectedEmployee.id}`, {
        prenom: firstName,
        nom: lastName,
        email: editForm.email,
        poste: editForm.role,
        situationFamiliale: editForm.situationFamiliale,
        nombreEnfants: parseInt(editForm.nombreEnfants) || 0,
        telephone: editForm.telephone,
        cin: editForm.cin,
        localisation: editForm.localisation,
        salaire: parseFloat(editForm.salaire) || 0
      });

      showToast('Profil mis à jour !', 'success');
      logSystemActivity(
        "Modification d'employé",
        user?.name,
        `Modification du profil de ${selectedEmployee.name} -> Nouveau rôle: ${editForm.role}`
      );
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      const errMsg = error.response?.data?.message || 'Erreur lors de la modification de l\'employé';
      showToast(errMsg, 'error');
    }
  };

  const onDeleteSubmit = async () => {
    try {
      await api.delete(`/employes/${selectedEmployee.id}`);
      showToast('L\'employé a été retiré du système.', 'error');
      logSystemActivity(
        "Suppression d'employé",
        user?.name,
        `Suppression définitive du compte de l'employé ${selectedEmployee.name}`
      );
      setIsDeleteModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errMsg = error.response?.data?.message || 'Erreur lors de la suppression de l\'employé';
      showToast(errMsg, 'error');
    }
  };

  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      const list = res.data.data || [];
      setServices(list);
      if (list.length > 0) {
        setAddForm(prev => ({ ...prev, dept: list[0].nom }));
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoadingData(true);
      const response = await api.get('/employes');
      
      const mappedEmployees = response.data.data.map(emp => ({
        id: emp.id,
        name: `${emp.prenom} ${emp.nom}`,
        email: emp.user?.email || `${emp.prenom.toLowerCase()}.${emp.nom.toLowerCase()}@rh.ma`,
        role: emp.poste || "Employé",
        type: emp.statut || "Temps plein",
        dept: emp.service?.nom || "Non assigné",
        date: emp.dateRecrutement ? new Date(emp.dateRecrutement).toLocaleDateString('fr-FR') : "-",
        status: emp.statut || 'Actif',
        initials: `${emp.prenom?.[0] || ''}${emp.nom?.[0] || ''}`.toUpperCase(),
        bg: "#2563EB",
        raw: emp
      }));
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('Erreur lors du chargement des employés', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchServices();
  }, []);

  // Apply strict Department Filter for Department Managers and Interim Managers
  const filteredEmployees = employees.filter(emp => {
    // 1. Search Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchEmail) return false;
    }

    // 2. Department filter
    if (isDeptManager) {
      const userDept = user?.dept?.toLowerCase() || '';
      const empDept = emp.dept.toLowerCase();
      if (!empDept.includes(userDept) && !userDept.includes(empDept)) return false;
    } else if (selectedDept !== 'all') {
      if (emp.dept !== selectedDept) return false;
    }

    // 3. Status filter
    if (selectedStatus !== 'all') {
      if (emp.status !== selectedStatus) return false;
    }

    return true;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedStatus]);

  const ITEMS_PER_PAGE = 4;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Dynamic statistics calculated from database records
  const activeCount = filteredEmployees.filter(e => e.status.toUpperCase() === 'ACTIF' || e.status === 'Actif').length;
  const onboardingCount = filteredEmployees.filter(e => e.status.toUpperCase() === 'INTEGRATION' || e.status.toUpperCase() === 'ONBOARDING' || e.type.toUpperCase() === 'STAGE' || e.type.toUpperCase() === 'INTEGRATION').length;
  const onLeaveCount = filteredEmployees.filter(e => e.status.toUpperCase() === 'EN_CONGE' || e.status.toUpperCase() === 'CONGE' || e.status.toUpperCase() === 'EN CONGÉ' || e.status === 'En Congé').length;
  const deptsCount = new Set(filteredEmployees.map(e => e.dept).filter(d => d && d !== "Non assigné")).size;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="header">
        <div className="header-title">
          <h1>{isDeptManager ? t('sidebar.myTeam') : t('employees.title')}</h1>
          <p>{isDeptManager ? "Visualisez et suivez les membres de votre département uniquement." : t('employees.subtitle')}</p>
        </div>
        <div className="header-actions">
          {canCreate && (
            <button className="action-btn primary" onClick={() => setIsAddModalOpen(true)}>
              <i className="fas fa-user-plus"></i> {t('employees.addEmployee')}
            </button>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue-card" style={isLoadingData ? { padding: 0, border: 'none' } : {}}>
          {isLoadingData ? <Skeleton height="120px" borderRadius="16px" /> : (
            <>
              <div className="stat-header">
                <div className="stat-icon primary"><i className="fas fa-users"></i></div>
              </div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">{t('employees.stats.active')}</div>
            </>
          )}
        </div>
        <div className="stat-card purple-card" style={isLoadingData ? { padding: 0, border: 'none' } : {}}>
          {isLoadingData ? <Skeleton height="120px" borderRadius="16px" /> : (
            <>
              <div className="stat-header">
                <div className="stat-icon success" style={{ background: '#E0E7FF', color: '#4F46E5' }}><i className="fas fa-user-plus"></i></div>
              </div>
              <div className="stat-value">{onboardingCount}</div>
              <div className="stat-label">{t('employees.stats.onboarding')}</div>
            </>
          )}
        </div>
        <div className="stat-card amber-card" style={isLoadingData ? { padding: 0, border: 'none' } : {}}>
          {isLoadingData ? <Skeleton height="120px" borderRadius="16px" /> : (
            <>
              <div className="stat-header">
                <div className="stat-icon warning"><i className="fas fa-umbrella-beach"></i></div>
              </div>
              <div className="stat-value">{onLeaveCount}</div>
              <div className="stat-label">{t('employees.stats.onLeave')}</div>
            </>
          )}
        </div>
        <div className="stat-card emerald-card" style={isLoadingData ? { padding: 0, border: 'none' } : {}}>
          {isLoadingData ? <Skeleton height="120px" borderRadius="16px" /> : (
            <>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}><i className="fas fa-building"></i></div>
              </div>
              <div className="stat-value">{deptsCount}</div>
              <div className="stat-label">{t('employees.stats.departments')}</div>
            </>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="card glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">{isDeptManager ? `Membres - Département ${user?.dept}` : t('employees.title')}</h3>
          <div className="filter-group">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder={t('employees.filters.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!isDeptManager && (
              <select 
                className="filter-pill filter-pill-blue" 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ cursor: 'pointer', border: 'none', outline: 'none', paddingRight: '28px', backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232563EB%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '0.65rem auto', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
              >
                <option value="all">Tous les Départements</option>
                {services.map(s => (
                  <option key={s.id} value={s.nom}>{s.nom}</option>
                ))}
              </select>
            )}
            <select 
              className="filter-pill filter-pill-green" 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ cursor: 'pointer', border: 'none', outline: 'none', paddingRight: '28px', backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2316A34A%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '0.65rem auto', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
            >
              <option value="all">Tous les Statuts</option>
              <option value="Actif">Actif</option>
              <option value="En Congé">En Congé</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>
        </div>

        <div className="table-container table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t('employees.table.employee')}</th>
                <th>{t('employees.table.role')}</th>
                <th>{t('employees.table.department')}</th>
                <th>{t('employees.table.hiredDate')}</th>
                <th>{t('employees.table.status')}</th>
                <th style={{ textAlign: 'center' }}>{t('employees.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingData ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                    Aucun employé trouvé.
                  </td>
                </tr>
              ) : paginatedEmployees.map((emp, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <img src={`https://ui-avatars.com/api/?name=${emp.name}&background=${emp.bg.replace('#','')}&color=fff`} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <div>
                        <span className="user-info-name">{emp.name}</span>
                        <span className="user-info-sub">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{emp.role}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{emp.type}</div>
                  </td>
                  <td><span className="dept-pill" style={{ background: '#EFF6FF', color: '#2563EB' }}>{emp.dept}</span></td>
                  <td style={{ color: '#64748B' }}>{emp.date}</td>
                  <td><span className={`modern-status-badge ${emp.status === 'Actif' ? 'badge-success' : emp.status === 'En Congé' ? 'badge-warning' : 'badge-info'}`}>{emp.status}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button className="modern-action-btn" onClick={() => handleAction('view', emp)} title={t('employees.table.view')}><i className="far fa-eye"></i></button>
                      
                      {canEdit && (
                        <button className="modern-action-btn" onClick={() => handleAction('edit', emp)} title={t('employees.table.edit')}><i className="far fa-edit"></i></button>
                      )}
                      
                      {canDelete && (
                        <button className="modern-action-btn" onClick={() => handleAction('delete', emp)} title={t('employees.table.delete')}><i className="far fa-trash-alt"></i></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={currentPage} 
          totalItems={filteredEmployees.length} 
          itemsPerPage={ITEMS_PER_PAGE} 
          onPageChange={setCurrentPage} 
        />
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={t('employees.modals.addTitle')}
        icon="fas fa-user-plus"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        <form onSubmit={onAddSubmit} style={{ padding: '4px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} color="var(--primary)" /> {t('employees.form.firstName')}
              </label>
              <input type="text" required value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} className="form-input" placeholder="Jean" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} color="var(--primary)" /> {t('employees.form.lastName')}
              </label>
              <input type="text" required value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} className="form-input" placeholder="Dupont" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} color="var(--c-purple)" /> {t('employees.form.email')}
              </label>
              <input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="form-input" placeholder="jean.d@comp.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={12} color="var(--c-orange)" /> {t('employees.form.role')}
              </label>
              <input type="text" required value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="form-input" placeholder="Développeur" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={12} color="var(--success)" /> {t('employees.form.department')}
              </label>
              <select className="form-input" value={addForm.dept} onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })}>
                {services.map(s => (
                  <option key={s.id} value={s.nom}>{s.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="var(--c-blue)" /> {t('employees.form.contract')}
              </label>
              <select className="form-input" value={addForm.contract} onChange={(e) => setAddForm({ ...addForm, contract: e.target.value })}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} color="var(--c-teal)" /> Téléphone
              </label>
              <input type="text" value={addForm.telephone} onChange={(e) => setAddForm({ ...addForm, telephone: e.target.value })} className="form-input" placeholder="06..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CreditCard size={12} color="var(--c-purple)" /> C.I.N
              </label>
              <input type="text" value={addForm.cin} onChange={(e) => setAddForm({ ...addForm, cin: e.target.value })} className="form-input" placeholder="AB12345" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--text-gray)" /> Localisation
              </label>
              <input type="text" value={addForm.localisation} onChange={(e) => setAddForm({ ...addForm, localisation: e.target.value })} className="form-input" placeholder="Ville / Adresse" />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={12} color="var(--danger)" /> Situation Familiale
              </label>
              <select className="form-input" value={addForm.situationFamiliale} onChange={(e) => setAddForm({ ...addForm, situationFamiliale: e.target.value })}>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} color="var(--c-teal)" /> Nombre d'enfants
              </label>
              <input type="number" min="0" value={addForm.nombreEnfants} onChange={(e) => setAddForm({ ...addForm, nombreEnfants: e.target.value })} className="form-input" disabled={addForm.situationFamiliale === 'Célibataire'} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} color="var(--danger)" /> Salaire (MAD)
              </label>
              <input type="number" min="0" value={addForm.salaire} onChange={(e) => setAddForm({ ...addForm, salaire: e.target.value })} className="form-input" placeholder="ex: 15000" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="action-btn primary" disabled={!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.role} style={{ flex: 2, height: '42px', opacity: (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.role) ? 0.5 : 1, cursor: (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.role) ? 'not-allowed' : 'pointer' }}>{t('employees.form.createProfile')}</button>
            <button type="button" className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsAddModalOpen(false)}>{t('employees.form.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title={t('employees.modals.viewTitle')}
        icon="far fa-eye"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        {selectedEmployee && (
          <div style={{ padding: '0' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: selectedEmployee.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 6px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                {selectedEmployee.initials}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '2px' }}>{selectedEmployee.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span className="filter-tag blue" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>{selectedEmployee.role}</span>
                <span className="modern-status-badge badge-success" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>{selectedEmployee.status}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Mail size={10} color="var(--primary)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>EMAIL</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.email}</span>
              </div>

              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Phone size={10} color="var(--c-blue)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>TÉLÉPHONE</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.raw?.telephone || '-'}</span>
              </div>

              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Building2 size={10} color="var(--c-purple)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>DÉPARTEMENT</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.dept}</span>
              </div>

              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <ShieldCheck size={10} color="var(--c-orange)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>MATRICULE</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{selectedEmployee.raw?.matricule || `#EMP-00${selectedEmployee.id}`}</span>
              </div>
              
              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <CreditCard size={10} color="var(--c-teal)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>C.I.N</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.raw?.cin || '-'}</span>
              </div>

              <div className="detail-box" style={{ padding: '4px 6px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <MapPin size={10} color="var(--text-gray)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>LOCALISATION / ADRESSE</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.raw?.localisation || selectedEmployee.raw?.adresse || '-'}</span>
              </div>

              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Calendar size={10} color="var(--success)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>EMBAUCHE</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.date}</span>
              </div>
              
              <div className="detail-box" style={{ padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <FileText size={10} color="var(--c-orange)" />
                  <span className="detail-label" style={{ fontSize: '0.6rem' }}>CONTRAT</span>
                </div>
                <span className="detail-value" style={{ fontSize: '0.7rem' }}>{selectedEmployee.raw?.contrat || selectedEmployee.type || '-'}</span>
              </div>

              {/* Ligne pour le salaire et autres infos privées (Visible seulement pour RH/Admin) */}
              {(isHRManager || isHRAgent) && (
                <>
                  <div className="detail-box" style={{ padding: '4px 6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Heart size={10} color="var(--danger)" />
                      <span className="detail-label" style={{ fontSize: '0.6rem' }}>SIT. FAMILIALE</span>
                    </div>
                    <span className="detail-value" style={{ fontSize: '0.7rem' }}>
                      {selectedEmployee.raw?.situationFamiliale || '-'} 
                      {selectedEmployee.raw?.nombreEnfants ? ` (${selectedEmployee.raw.nombreEnfants})` : ''}
                    </span>
                  </div>

                  <div className="detail-box" style={{ padding: '4px 6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <DollarSign size={10} color="var(--danger)" />
                      <span className="detail-label" style={{ fontSize: '0.6rem' }}>SALAIRE MENSUEL</span>
                    </div>
                    <span className="detail-value" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{selectedEmployee.raw?.salaire ? `${selectedEmployee.raw.salaire.toLocaleString()} MAD` : '-'}</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="action-btn primary" style={{ flex: 1, justifyContent: 'center', height: '36px', fontSize: '0.8rem' }} onClick={() => { showToast('Email de contact envoyé !', 'info'); setIsViewModalOpen(false); }}>
                {t('employees.detail.contact')}
              </button>
              <button className="action-btn" style={{ flex: 1, justifyContent: 'center', height: '36px', fontSize: '0.8rem' }} onClick={() => setIsViewModalOpen(false)}>
                {t('employees.detail.close')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={t('employees.modals.editTitle')}
        icon="far fa-edit"
        iconColor="var(--primary)"
        iconBg="var(--primary-bg)"
        showFooter={false}
      >
        {selectedEmployee && (
          <form onSubmit={onEditSubmit} style={{ padding: '4px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} color="var(--primary)" /> {t('employees.table.employee')}
                </label>
                <input type="text" className="form-input" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} color="var(--c-purple)" /> {t('employees.form.email')}
                </label>
                <input type="email" className="form-input" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={12} color="var(--c-orange)" /> {t('employees.form.role')}
                </label>
                <input type="text" className="form-input" required value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={12} color="var(--danger)" /> Situation Familiale
                </label>
                <select className="form-input" value={editForm.situationFamiliale} onChange={(e) => setEditForm({ ...editForm, situationFamiliale: e.target.value })}>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} color="var(--c-teal)" /> Nombre d'enfants
                </label>
                <input type="number" min="0" value={editForm.nombreEnfants} onChange={(e) => setEditForm({ ...editForm, nombreEnfants: e.target.value })} className="form-input" disabled={editForm.situationFamiliale === 'Célibataire'} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} color="var(--c-teal)" /> Téléphone
                </label>
                <input type="text" value={editForm.telephone} onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })} className="form-input" placeholder="06..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={12} color="var(--c-purple)" /> C.I.N
                </label>
                <input type="text" value={editForm.cin} onChange={(e) => setEditForm({ ...editForm, cin: e.target.value })} className="form-input" placeholder="AB12345" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="var(--text-gray)" /> Localisation
                </label>
                <input type="text" value={editForm.localisation} onChange={(e) => setEditForm({ ...editForm, localisation: e.target.value })} className="form-input" placeholder="Ville / Adresse" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={12} color="var(--danger)" /> Salaire (MAD)
                </label>
                <input type="number" min="0" value={editForm.salaire} onChange={(e) => setEditForm({ ...editForm, salaire: e.target.value })} className="form-input" placeholder="ex: 15000" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="action-btn primary" disabled={!editForm.name || !editForm.email || !editForm.role} style={{ flex: 2, height: '42px', opacity: (!editForm.name || !editForm.email || !editForm.role) ? 0.5 : 1, cursor: (!editForm.name || !editForm.email || !editForm.role) ? 'not-allowed' : 'pointer' }}>{t('employees.form.saveChanges')}</button>
              <button type="button" className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsEditModalOpen(false)}>{t('employees.form.cancel')}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('employees.modals.deleteTitle')}
        icon="fas fa-trash-alt"
        iconColor="var(--danger)"
        iconBg="var(--danger-bg)"
        showFooter={false}
      >
        {selectedEmployee && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <AlertTriangle size={30} />
            </div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: 700 }}>{t('employees.delete.areYouSure')}</h4>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              {t('employees.delete.confirmDescPre')} <strong>{selectedEmployee.name}</strong>. {t('employees.delete.confirmDescPost')}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="action-btn" style={{ flex: 1, height: '42px', backgroundColor: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={onDeleteSubmit}>
                {t('employees.delete.confirmBtn')}
              </button>
              <button className="action-btn" style={{ flex: 1, height: '42px' }} onClick={() => setIsDeleteModalOpen(false)}>
                {t('employees.delete.cancelBtn')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Employees;
