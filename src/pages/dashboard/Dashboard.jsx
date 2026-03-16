import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import {
  getUserResources,
  getUserTasks,
} from "../../services/firebase/firestore";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    projects,
    loadProjects,
    loading: loadingProjects,
  } = useProjects(user?.uid);

  const [totalResources, setTotalResources] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  const [overdueTasks, setOverdueTasks] = useState([]);
  const [priorityTasks, setPriorityTasks] = useState([]);
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

      const pending = tasksResponse.filter((t) => t.status !== "completed");
      const completed = tasksResponse.filter((t) => t.status === "completed");

      setPendingTasks(pending.length);
      setCompletedTasksCount(completed.length);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = pending.filter(
        (t) => t.dueDate && new Date(t.dueDate + "T00:00:00") < today,
      );
      setOverdueTasks(overdue);

      // Filter out overdue from priority to avoid duplicate highlighting
      const highPriority = pending.filter(
        (t) => t.priority === "high" && !overdue.find((o) => o.id === t.id),
      );
      setPriorityTasks(highPriority);

      const upcoming = pending
        .filter((t) => t.dueDate && new Date(t.dueDate + "T00:00:00") >= today)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      setUpcomingTasks(upcoming);
    } catch (err) {
      if (err.code === "Permiso Denegado") return;
      console.error("Error cargando estadísticas", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const isLoading = loadingProjects || loadingStats;

  const renderCompactMetric = (label, value, iconSvg, colorVar, bgVar) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          padding: "0.5rem",
          background: bgVar,
          color: colorVar,
          borderRadius: "8px",
          display: "flex",
        }}
      >
        {iconSvg}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-main)",
            fontFamily: "var(--font-display)",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <header
        className="page-header"
        style={{ marginBottom: "var(--spacing-xl)" }}
      >
        <div>
          <h1>Resumen de Actividad</h1>
          <p>
            Bienvenido, <strong>{user?.email}</strong>. Este es el estado de tu
            investigación hoy.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="empty-state">
          <p>Calculando prioridades...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "400px" }}>
          <img
            src="/empty-dashboard.webp"
            alt="Dashboard Vacío"
            className="empty-img"
            style={{ width: "200px" }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <h3>Bienvenido a Recolector</h3>
          <p>
            Para desbloquear tu progreso, comienza registrando tu primer
            proyecto en la barra de navegación.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--spacing-lg)",
            alignItems: "start",
          }}
        >
          {/* COLUMNA PRINCIPAL DE ACCIÓN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            {/* Tareas Vencidas Urgentes */}
            {overdueTasks.length > 0 && (
              <div
                className="card"
                style={{
                  border: "1px solid var(--danger)",
                  background: "var(--danger-bg)",
                }}
              >
                <h3
                  style={{
                    color: "var(--danger)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Tareas Vencidas ({overdueTasks.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        background: "var(--surface)",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                      <span style={{ color: "var(--danger)" }}>
                        {new Date(
                          task.dueDate + "T00:00:00",
                        ).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  ))}
                  {overdueTasks.length > 3 && (
                    <Link
                      to="/tasks"
                      style={{
                        fontSize: "0.85rem",
                        textAlign: "center",
                        width: "100%",
                        display: "block",
                        marginTop: "0.5rem",
                        color: "var(--primary)",
                      }}
                    >
                      Ver todas las tareas vencidas...
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Foco de hoy / Próximas */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                  Próximas Entregas
                </h2>
                <span className="badge pending">
                  {upcomingTasks.length} activas
                </span>
              </div>

              {upcomingTasks.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No tienes entregas próximas, ¡estás al día!
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem",
                        background: "var(--bg-main)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.4rem",
                          background: "var(--primary-light)",
                          borderRadius: "6px",
                          color: "var(--primary)",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          width: "55px",
                          textAlign: "center",
                        }}
                      >
                        {new Date(
                          task.dueDate + "T00:00:00",
                        ).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 0.1rem 0",
                            fontSize: "0.95rem",
                          }}
                        >
                          {task.title}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Prioridad: {task.priority}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tareas Alta Prioridad Sin Fecha */}
            {priorityTasks.length > 0 && (
              <div className="card">
                <h2
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                    color: "var(--warning)",
                  }}
                >
                  Alta Prioridad General
                </h2>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {priorityTasks.slice(0, 4).map((t) => (
                    <span
                      key={t.id}
                      style={{
                        background: "var(--warning-bg)",
                        color: "var(--warning)",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {t.title}
                    </span>
                  ))}
                  {priorityTasks.length > 4 && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      +{priorityTasks.length - 4} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL DE MÉTRICAS COMPACTAS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            <div
              className="card"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  margin: "0 0 0.5rem 0",
                  color: "white",
                }}
              >
                Resumen de Carga
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.9,
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                Estado general de tus obligaciones pendientes.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "3rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {pendingTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.8,
                      marginTop: "0.2rem",
                    }}
                  >
                    Pendientes de {totalTasks} totales
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {completedTasksCount}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.8,
                      marginTop: "0.2rem",
                    }}
                  >
                    Completadas
                  </div>
                </div>
              </div>
            </div>

            <h3
              style={{
                fontSize: "1rem",
                margin: "0.5rem 0 0 0",
                color: "var(--text-muted)",
              }}
            >
              Inventario General
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {renderCompactMetric(
                "Proyectos",
                projects.length,
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>,
                "var(--primary)",
                "var(--primary-light)",
              )}
              {renderCompactMetric(
                "Recursos",
                totalResources,
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>,
                "#0EA5E9",
                "#E0F2FE",
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
