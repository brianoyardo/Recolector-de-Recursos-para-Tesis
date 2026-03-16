import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import "../../styles/layout.css";

export const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="app-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
