import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

import {
  NotificationProvider,
} from './context/NotificationContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { DashboardRouter } from './pages/Dashboards/DashboardRouter';
import { ProjectList } from './pages/Projects/ProjectList';
import { ProjectDetail } from './pages/Projects/ProjectDetail';
import { TaskList } from './pages/Tasks/TaskList';
import { TaskKanban } from './pages/Tasks/TaskKanban';
import { TimesheetHub } from './pages/Timesheets/TimesheetHub';
import { ApprovalDesk } from './pages/Approvals/ApprovalDesk';
import { ReportsHub } from './pages/Reports/ReportsHub';
import { AiInsightsHub } from './pages/AiCopilot/AiInsightsHub';
import { AuditLogView } from './pages/AuditLogs/AuditLogView';
import { UserManagement } from './pages/Admin/UserManagement';


const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();

  const [isProjectModalOpen, setIsProjectModalOpen] =
    useState(false);

  const [isTimeModalOpen, setIsTimeModalOpen] =
    useState(false);

  // ---------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ---------------------------------------------------------
  // APPLICATION LAYOUT
  // ---------------------------------------------------------

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-slate-100
        flex
        flex-col
        relative
        overflow-hidden
      "
    >

      {/* =====================================================
          BACKGROUND AMBIENT GLOW
      ====================================================== */}

      <div className="ambient-glow" />

      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <Navbar
        onOpenProjectModal={() =>
          setIsProjectModalOpen(true)
        }
        onOpenTimeModal={() =>
          setIsTimeModalOpen(true)
        }
      />

      {/* =====================================================
          SIDEBAR + MAIN CONTENT
      ====================================================== */}

      <div
        className="
          flex-1
          flex
          min-h-0
          overflow-hidden
        "
      >

        {/* ===================================================
            SIDEBAR

            Sidebar remains unchanged.
        ==================================================== */}

        <Sidebar />

        {/* ===================================================
            MAIN AREA

            IMPORTANT:
            Do NOT put max-w-7xl or mx-auto directly on main.

            The main area must occupy ALL remaining space
            after the sidebar.

            The inner container handles centering.
        ==================================================== */}

        <main
          className="
            flex-1
            min-w-0
            min-h-0
            overflow-y-auto
            overflow-x-hidden
            relative
            z-10
          "
        >

          {/* =================================================
              CENTERED PAGE CONTAINER
          ================================================== */}

          <div
            className="
              w-full
              max-w-[1600px]
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              xl:px-10
              py-5
              lg:py-7
            "
          >

            {/* =================================================
                APPLICATION ROUTES
            ================================================== */}

            <Routes>

              {/* -------------------------------------------------
                  DEFAULT
              -------------------------------------------------- */}

              <Route
                path="/"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

              {/* -------------------------------------------------
                  DASHBOARD
              -------------------------------------------------- */}

              <Route
                path="/dashboard"
                element={
                  <DashboardRouter
                    onOpenProjectModal={() =>
                      setIsProjectModalOpen(true)
                    }
                    onOpenTimeModal={() =>
                      setIsTimeModalOpen(true)
                    }
                  />
                }
              />

              {/* -------------------------------------------------
                  PROJECTS
              -------------------------------------------------- */}

              <Route
                path="/projects"
                element={
                  <ProjectList
                    isModalOpen={isProjectModalOpen}
                    setIsModalOpen={
                      setIsProjectModalOpen
                    }
                  />
                }
              />

              <Route
                path="/projects/:id"
                element={<ProjectDetail />}
              />

              {/* -------------------------------------------------
                  TASKS
              -------------------------------------------------- */}

              <Route
                path="/tasks"
                element={<TaskList />}
              />

              <Route
                path="/kanban"
                element={<TaskKanban />}
              />

              {/* -------------------------------------------------
                  TIMESHEETS
              -------------------------------------------------- */}

              <Route
                path="/timesheets"
                element={<TimesheetHub />}
              />

              {/* -------------------------------------------------
                  APPROVALS
              -------------------------------------------------- */}

              <Route
                path="/approvals"
                element={<ApprovalDesk />}
              />

              {/* -------------------------------------------------
                  REPORTS
              -------------------------------------------------- */}

              <Route
                path="/reports"
                element={<ReportsHub />}
              />

              {/* -------------------------------------------------
                  AI INSIGHTS
              -------------------------------------------------- */}

              <Route
                path="/ai-copilot"
                element={<AiInsightsHub />}
              />

              {/* -------------------------------------------------
                  AUDIT LOGS
              -------------------------------------------------- */}

              <Route
                path="/audit-logs"
                element={<AuditLogView />}
              />

              {/* -------------------------------------------------
                  USER MANAGEMENT
              -------------------------------------------------- */}

              <Route
                path="/admin/users"
                element={<UserManagement />}
              />

              {/* -------------------------------------------------
                  FALLBACK
              -------------------------------------------------- */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Routes>

          </div>

        </main>

      </div>

    </div>
  );
};


// =============================================================
// ROOT APPLICATION
// =============================================================

export default function App() {
  return (
    <AuthProvider>

      <NotificationProvider>

        <Router>

          <Routes>

            {/* =================================================
                LOGIN
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* =================================================
                PROTECTED APPLICATION
            ================================================== */}

            <Route
              path="/*"
              element={<ProtectedLayout />}
            />

          </Routes>

        </Router>

      </NotificationProvider>

    </AuthProvider>
  );
}
