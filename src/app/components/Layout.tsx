import { Outlet, Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Gauge, 
  Users, 
  BrainCircuit, 
  FileText, 
  Settings as SettingsIcon,
  Leaf,
  Menu,
  X,
  Sparkles,
  Trophy,
  Bot,
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Data Ingestion', href: '/data-ingestion', icon: Sparkles, badge: 'NEW' },
  { name: 'Emissions Tracking', href: '/emissions', icon: Gauge },
  { name: 'Supplier Management', href: '/suppliers', icon: Users },
  { name: 'AI Insights', href: '/ai-insights', icon: BrainCircuit },
  { name: 'AI Chat Assistant', href: '/ai-chat', icon: Bot, badge: 'AI' },
  { name: 'Reports & Compliance', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Leaf className="size-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  EcoTrack AI
                </h1>
                <p className="text-xs text-gray-600">ESG Performance Platform</p>
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-emerald-50"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Real-time Monitoring Active</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-emerald-100"
            >
              <nav className="px-4 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                          : 'hover:bg-emerald-50 text-gray-700'
                      }`}
                    >
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.badge && <span className="ml-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white/50 backdrop-blur-sm border-r border-emerald-100 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'hover:bg-emerald-50 text-gray-700'
                  }`}
                >
                  <item.icon className="size-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && <span className="ml-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}