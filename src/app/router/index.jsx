import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../../components/layout/AppLayout";

// Vistas
import { Login } from "../../pages/auth/Login";
import { Register } from "../../pages/auth/Register";
import { Dashboard } from "../../pages/dashboard/Dashboard";
import { Projects } from "../../pages/projects/Projects";
import { Resources } from "../../pages/resources/Resources";
import { Tasks } from "../../pages/tasks/Tasks";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <ProtectedRoute />, // 1. Protege todo lo de abajo
    children: [
      {
        path: "/",
        element: <AppLayout />, // 2. Instala la carcasa visual
        children: [
          // 3. Renderiza las vistas dentro de AppLayout
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "projects", element: <Projects /> },
          { path: "resources", element: <Resources /> },
          { path: "tasks", element: <Tasks /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
