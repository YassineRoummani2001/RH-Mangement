import React, { createContext, useState, useEffect, useContext } from 'react';
import { logSystemActivity, getEffectiveRole } from '../utils/rbac';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (email, password, role = 'HR_MANAGER') => {
    const roleProfiles = {
      HR_MANAGER:          { name: 'Sarah Connor',         title: 'Administrateur RH',      dept: 'Ressources Humaines',  bg: '2563EB' },
      HR_AGENT:            { name: 'Marc Leblanc',         title: 'Agent RH',               dept: 'Ressources Humaines',  bg: '7C3AED' },
      EMPLOYEE:            { name: 'Ali Benali',           title: 'Employé',                dept: 'Ingénierie',            bg: '059669' },
      DEPARTMENT_MANAGER:  { name: 'Leila Mansour',        title: 'Chef de Service',        dept: 'Ingénierie',            bg: 'D97706' },
      INTERIM_MANAGER:     { name: 'Hassan Alami',         title: 'Chef de Service Intérim',dept: 'Finance',               bg: 'DC2626' },
      SECRETARY_GENERAL:   { name: 'Fatima Zahra Alaoui',  title: 'Secrétaire Générale',   dept: 'Direction Générale',    bg: 'BE185D' },
    };
    
    const profile = roleProfiles[role] ?? roleProfiles['HR_MANAGER'];
    const initials = profile.name.split(' ').map(n => n[0]).join('+');

    // Default interim until is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockUser = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: profile.name,
      title: profile.title,
      email,
      role,
      dept: profile.dept,
      avatar: `https://ui-avatars.com/api/?name=${initials}&background=${profile.bg}&color=fff`,
      ...(role === 'INTERIM_MANAGER' ? { interimUntil: tomorrow.toISOString() } : {})
    };
    
    setUser(mockUser);
    logSystemActivity("Connexion", mockUser.name, `Session ouverte pour ${mockUser.title} (${role})`);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      logSystemActivity("Déconnexion", user.name, "Déconnexion de la session utilisateur");
    }
    setUser(null);
  };

  const effectiveRole = user ? getEffectiveRole(user) : null;

  return (
    <AuthContext.Provider value={{ user, setUser, effectiveRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
