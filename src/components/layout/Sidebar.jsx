import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../services/firebase/auth";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import "../../styles/sidebar.css";

// SVG Icons inline para no instalar librerías pesadas si no es vital (Lucide style)
const DashboardIcon = () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const ProjectsIcon = () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>;
const ResourcesIcon = () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const TasksIcon = () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const LogoutIcon = () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export const Sidebar = () => {
  const { user } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Recolector</h2>
          <span className="user-email" title={user?.email}>{user?.email}</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                <DashboardIcon /> Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects" className={({ isActive }) => isActive ? "active" : ""}>
                <ProjectsIcon /> Proyectos
              </NavLink>
            </li>
            <li>
              <NavLink to="/resources" className={({ isActive }) => isActive ? "active" : ""}>
                <ResourcesIcon /> Biblioteca
              </NavLink>
            </li>
            <li>
              <NavLink to="/tasks" className={({ isActive }) => isActive ? "active" : ""}>
                <TasksIcon /> Tareas
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => setIsLogoutModalOpen(true)}>
            <LogoutIcon /> Salir
          </button>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      {/* El AppLayout lo renderizará si está en móvil */}
      <div className="mobile-top-header">
         <div className="mobile-top-brand">Recolector</div>
         <button className="btn-icon" onClick={() => setIsLogoutModalOpen(true)} style={{border: 'none', boxShadow: 'none'}}>
            <LogoutIcon />
         </button>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
          <DashboardIcon />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
          <ProjectsIcon />
          <span>Proyectos</span>
        </NavLink>
        <NavLink to="/resources" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
          <ResourcesIcon />
          <span>Biblioteca</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
          <TasksIcon />
          <span>Tareas</span>
        </NavLink>
      </nav>

      {/* UI Modal Interno: Adiós al window.confirm crudo */}
      <ConfirmDialog 
        isOpen={isLogoutModalOpen}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas salir? Tendrás que volver a ingresar tus credenciales."
        confirmText="Salir de mi cuenta"
        cancelText="Permanecer"
        isDestructive={false}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
