import { useState, useEffect } from "react";
import { API_URL } from "../api";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Bot,
  Menu,
  X,
  WifiOff,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/missions", label: "Missions", icon: Briefcase },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
];

const pageTitles = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/missions": "Missions",
  "/invoices": "Invoices",
  "/assistant": "AI Assistant",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const check = () =>
      fetch(`${API_URL}/health`)
        .then((r) => { setBackendDown(!r.ok); })
        .catch(() => setBackendDown(true));
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentTitle =
    Object.entries(pageTitles).find(([path]) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
    )?.[1] || "Freelance CRM";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-[4.5rem] px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <img src="/logo.png" alt="Freelance CRM Logo" className="h-8 w-8 rounded-[10px] object-cover" />
            </div>
            <span className="text-[1.1rem] font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Freelance CRM
            </span>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-200 ${isActive ? "scale-110 text-indigo-400" : "group-hover:scale-110 group-hover:text-slate-200"}`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-800/10 border border-slate-700/50 p-4 text-center shadow-inner">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Powered by AI</p>
            <p className="text-xs text-slate-500">Freelance CRM v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-20">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{currentTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {backendDown && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <WifiOff size={16} /> Backend server is unreachable. Make sure the Flask server is running on port 5000.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
