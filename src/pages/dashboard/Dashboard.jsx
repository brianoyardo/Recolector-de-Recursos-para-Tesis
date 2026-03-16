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
  
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [highPriorityTasksCount, setHighPriorityTasksCount] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  
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
      
      const pending = tasksResponse.filter(t => t.status !== "completed");
      const completed = tasksResponse.filter(t => t.status === "completed");
      
      setPendingTasks(pending.length);
      setCompletedTasksCount(completed.length);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate + "T00:00:00") < today);
      setOverdueTasksCount(overdue.length);
      
      const highPriority = pending.filter(t => t.priority === 'high');
      setHighPriorityTasksCount(highPriority.length);
      
      const upcoming = pending
        .filter(t => t.dueDate && new Date(t.dueDate + "T00:00:00") >= today)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
        
      setUpcomingTasks(upcoming);

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
          
          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                 <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Tareas Vencidas</h3>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {overdueTasksCount}
            </p>
          </div>

          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                 <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Completadas</h3>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {completedTasksCount}
            </p>
          </div>

          <div className="card" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#FCE7F3', color: '#DB2777', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                 <h3 style={{ margin: '0 0 0.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Prioridad Alta</h3>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
              {highPriorityTasksCount}
            </p>
          </div>
          
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-2xl)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Próximas Entregas (Activas)</h2>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No tienes tareas activas con fechas de entrega próximas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '6px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', width: '60px', textAlign: 'center' }}>
                      {new Date(task.dueDate + "T00:00:00").toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>{task.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.priority.toUpperCase()} Prioridad</p>
                    </div>
                  </div>
                  <span className={`badge pending`}>Pendiente</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
