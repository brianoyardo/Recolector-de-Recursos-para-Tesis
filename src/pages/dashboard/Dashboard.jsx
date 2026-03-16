import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { getUserResources, getUserTasks } from "../../services/firebase/firestore";

export const Dashboard = () => {
  const { user } = useAuth();
  const { projects, loadProjects, loading: loadingProjects } = useProjects(user?.uid);
  
  const [totalResources, setTotalResources] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const resourcesResponse = await getUserResources(user.uid);
      setTotalResources(resourcesResponse.length);

      const tasksResponse = await getUserTasks(user.uid);
      setTotalTasks(tasksResponse.length);
      setPendingTasks(tasksResponse.filter(t => t.status === "pending").length);

    } catch (err) {
      if (err.code === "permission-denied") return;
      console.error("Error cargando estadísticas", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const isLoading = loadingProjects || loadingStats;

  return (
    <div>
      <header className="page-header" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1>Resumen General</h1>
          <p>Bienvenido de vuelta, <strong>{user?.email}</strong>. Tu espacio de control.</p>
        </div>
      </header>
      
      {isLoading ? (
        <div className="empty-state">
           <p>Calculando analíticas...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '400px' }}>
          <img src="/empty-dashboard.webp" alt="Dashboard Vacío" className="empty-img" style={{width: '200px'}} onError={(e) => e.target.style.display='none'} />
          <h3>Bienvenido a Recolector</h3>
          <p>Para desbloquear tu progreso, comienza registrando tu primer proyecto en la barra de navegación.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
          
          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Proyectos Activos</h3>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {projects.length}
            </p>
          </div>

          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#E0F2FE', color: '#0EA5E9', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div>
                 <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Recursos Bibliográficos</h3>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {totalResources}
            </p>
          </div>

          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', color: '#D97706', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                 <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Tareas Pendientes</h3>
              </div>
            </div>
            <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>{pendingTasks}</span>
              <span style={{fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '500'}}>/ {totalTasks}</span>
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
};
