import { Outlet, Link, useLocation } from 'react-router';
import { PageTransition } from './PageTransition';
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
  Bot,
  LogOut,
  Sun,
  Moon,
  Activity,
  FlaskConical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Data Ingestion', href: '/data-ingestion', icon: Sparkles, badge: 'NEW' },
  { name: 'Emissions Tracking', href: '/emissions', icon: Gauge },
  { name: 'Supplier Management', href: '/suppliers', icon: Users },
  { name: 'AI Insights', href: '/ai-insights', icon: BrainCircuit },
  { name: 'AI Chat Assistant', href: '/ai-chat', icon: Bot, badge: 'AI' },
  { name: 'Scenario Wizard', href: '/scenario', icon: FlaskConical, badge: 'NEW' },
  { name: 'ML Analytics', href: '/ml-analytics', icon: Activity, badge: 'NEW' },
  { name: 'ESG Analytics', href: '/esg-analytics', icon: Leaf, badge: 'AI' },
  { name: 'Reports & Compliance', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 mesh-bg">
      {/* Header */}
      <header className="glass bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                <Leaf className="size-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  EcoTrack AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ESG Performance Platform</p>
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Activity className="size-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live Monitoring</span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle dark mode"
              >
                {theme === 'dark' 
                  ? <Sun className="size-4 text-amber-400" /> 
                  : <Moon className="size-4 text-gray-600" />
                }
              </button>

              <button 
                onClick={() => supabase.auth.signOut()}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="size-4" />
                Log out
              </button>
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
              className="lg:hidden border-t border-emerald-100 dark:border-gray-800"
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
                          : 'hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.badge && <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                    </Link>
                  );
                })}
                <div className="border-t dark:border-gray-700 pt-3 mt-3 flex items-center justify-between px-4">
                  <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm text-red-500">
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-emerald-100 dark:border-gray-800 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                      : 'hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className={`size-5 transition-transform group-hover:scale-110 ${isActive ? '' : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-100 dark:border-gray-800">
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">EcoTrack AI v2.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">GHG Protocol Compliant</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}