import React, { createContext, useState, useEffect, useContext } from 'react';
import { logSystemActivity, getEffectiveRole } from '../utils/rbac';
import api from '../services/api';

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
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      // 1. Get Token
      const res = await api.post('/login', { email, password });
      const { token } = res.data;
      
      if (token) {
        localStorage.setItem('token', token);
        
        // 2. Get User Profile
        const profileRes = await api.get('/me');
        const userData = profileRes.data.data;
        
        // Ensure role compatibility with existing frontend
        // Assuming the backend roles like ROLE_ADMIN_RH map to HR_MANAGER
        const roleMapping = {
          'ROLE_ADMIN_RH': 'HR_MANAGER',
          'ROLE_AGENT_RH': 'HR_AGENT',
          'ROLE_EMPLOYE': 'EMPLOYEE',
          'ROLE_CHEF_SERVICE': 'DEPARTMENT_MANAGER',
          'ROLE_SECRETAIRE_GENERALE': 'SECRETARY_GENERAL'
        };
        
        const mainRole = userData.roles.find(r => roleMapping[r]) || 'ROLE_EMPLOYE';
        const mappedRole = roleMapping[mainRole] || 'EMPLOYEE';
        
        // Format the user for the frontend
        const frontendUser = {
          id: userData.id,
          name: userData.employe ? `${userData.employe.prenom} ${userData.employe.nom}` : email,
          title: userData.employe ? userData.employe.poste : 'Utilisateur',
          email: userData.email,
          role: mappedRole,
          dept: userData.employe?.service?.nom || 'Administration',
          avatar: userData.employe?.photo || `https://ui-avatars.com/api/?name=${email}&background=2563EB&color=fff`,
        };
        
        setUser(frontendUser);
        logSystemActivity("Connexion", frontendUser.name, `Session ouverte pour ${frontendUser.title} (${mappedRole})`);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
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
