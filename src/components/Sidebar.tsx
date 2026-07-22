import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { Calendar, Map, Users, Settings, LogOut, Menu } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Calendar size={24} />
        Serviço de Campo
      </div>
      <nav style={{ flexGrow: 1, marginTop: '10px' }}>
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Calendar size={20} />
          Início / Programação
        </NavLink>
        <NavLink to="/territory" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Map size={20} />
          Cobertura de Território
        </NavLink>
        {isAdmin && (
          <NavLink to="/records" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            Cadastros <span className="badge-admin">Admin</span>
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/users" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Gerenciar Usuários <span className="badge-admin">Admin</span>
          </NavLink>
        )}
      </nav>
      <button onClick={logout} className="nav-item" style={{ marginBottom: '10px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>
        <LogOut size={20} />
        Sair
      </button>
    </aside>
  );
}