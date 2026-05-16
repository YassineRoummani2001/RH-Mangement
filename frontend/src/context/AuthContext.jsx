import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Roles: 'EMPLOYEE', 'HR_AGENT', 'HR_MANAGER', 'DEPARTMENT_MANAGER'
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (email, password, role = 'HR_MANAGER') => {
    // Role-aware mock user data
    const roleProfiles = {
      HR_MANAGER:          { name: 'Sarah Connor',  title: 'Responsable RH' },
      HR_AGENT:            { name: 'Marc Leblanc',  title: 'Agent RH' },
      EMPLOYEE:            { name: 'Ali Benali',    title: 'Employé' },
      DEPARTMENT_MANAGER:  { name: 'Leila Mansour', title: 'Chef de service' },
      INTERIM_MANAGER:     { name: 'Hassan Alami',  title: 'Chef de service intérim' },
    };
    const profile = roleProfiles[role] ?? roleProfiles['HR_MANAGER'];
    const initials = profile.name.split(' ').map(n => n[0]).join('+');

    const mockUser = {
      id: 1,
      name: profile.name,
      title: profile.title,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff`
    };
    setUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
