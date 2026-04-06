import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Bell, 
  Settings,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['officer', 'teacher', 'supervisor', 'manager', 'parent'] },
    { name: 'Register Student', icon: UserPlus, path: '/register-student', roles: ['officer', 'supervisor'] },
    { name: 'Students', icon: Users, path: '/students', roles: ['officer', 'teacher', 'supervisor', 'manager'] },
    { name: 'Review Incidents', icon: ShieldCheck, path: '/review-incidents', roles: ['supervisor', 'admin'] },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['supervisor', 'manager'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['officer', 'teacher', 'supervisor', 'manager', 'parent'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-bgDarkAll text-primaryClrText overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-bgDark border-r border-white/5 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primaryClr flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-display font-bold text-primaryClr">SBTS</span>
          </div>

          <nav className="space-y-2">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-dangerClr hover:bg-dangerClr/10 rounded-xl w-full transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-bgDark/40 backdrop-blur-md border-bottom border-white/5 flex items-center justify-between px-8 z-10">
          <div>
            <h2 className="text-sm font-medium text-secondaryClr uppercase tracking-widest">
              Overview / {location.pathname.split('/')[1]?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-secondaryClr hover:text-primaryClr transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-dangerClr rounded-full border-2 border-bgDark"></span>
            </button>
            <div className="flex items-center gap-4 bg-bgDarkAll/50 px-4 py-2 rounded-2xl border border-white/5">
              <div className="text-right">
                <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-secondaryClr capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primaryClrLight/20 border border-primaryClr/20 flex items-center justify-center overflow-hidden">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <Users size={20} className="text-primaryClr" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Layout;
