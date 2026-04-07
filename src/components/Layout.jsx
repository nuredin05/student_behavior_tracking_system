import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
    { name: 'User Management', icon: ShieldCheck, path: '/users', roles: ['admin', 'supervisor'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['officer', 'teacher', 'supervisor', 'manager', 'parent'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-bgDarkAll text-primaryClrText overflow-hidden" onClick={() => setShowNotifications(false)}>
      {/* Sidebar */}
      <aside className="w-72 bg-bgDark border-r border-white/5 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
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
        <header className="h-20 bg-bgDark/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-20">
          <div>
            <h2 className="text-sm font-medium text-secondaryClr uppercase tracking-widest">
              Overview / {location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-xl transition-all duration-300 relative ${showNotifications ? 'bg-primaryClr/20 text-primaryClr' : 'text-secondaryClr hover:text-primaryClr hover:bg-white/5'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-dangerClr text-[10px] text-white flex items-center justify-center rounded-full border-2 border-bgDark animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-96 bg-bgDark border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-bgDarkAll/50">
                    <h4 className="font-bold">Notifications</h4>
                    <span className="text-[10px] bg-primaryClr/20 text-primaryClr px-2 py-0.5 rounded uppercase tracking-widest font-black">Latest</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center opacity-30">
                        <Bell size={40} className="mb-3" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleMarkRead(notif.id)}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex items-start gap-4 ${!notif.is_read ? 'bg-primaryClr/5' : ''}`}
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-primaryClr' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.is_read ? 'font-bold text-primaryClrText' : 'text-secondaryClr'}`}>{notif.title}</p>
                            <p className="text-xs text-secondaryClr mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-secondaryClr mt-2 opacity-50 uppercase tracking-tighter">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={async () => {
                        await api.put('/notifications/read-all');
                        fetchNotifications();
                      }}
                      className="w-full py-3 text-xs font-bold text-secondaryClr hover:text-primaryClr hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                      Clear All Notifications
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-bgDarkAll/50 px-4 py-2 rounded-2xl border border-white/5">
              <div className="text-right">
                <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-secondaryClr capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primaryClrLight/20 border border-primaryClr/20 flex items-center justify-center overflow-hidden">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="profile" className="w-full h-full object-cover shadow-inner" />
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
