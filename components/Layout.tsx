
import React from 'react';
import { ViewState } from '../types';
import { useTheme } from './ThemeContext';
import { 
  LayoutDashboard, 
  Egg, 
  Users, 
  BookOpen, 
  Wallet, 
  Scale, 
  AlertCircle,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  children: React.ReactNode;
}

interface NavItemProps {
  view: ViewState;
  current: ViewState;
  label: string;
  icon: React.ElementType;
  onClick: (v: ViewState) => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  view, 
  current, 
  label, 
  icon: Icon, 
  onClick 
}) => {
  const { settings, colors } = useTheme();
  const isActive = current === view;
  
  // Dynamic active classes based on theme
  const activeClass = settings.theme === 'DARK'
    ? 'bg-blue-900/40 text-blue-100'
    : settings.theme === 'FUN'
    ? 'bg-fuchsia-100 text-fuchsia-900'
    : 'bg-amber-100 text-amber-900';

  const inactiveClass = settings.theme === 'DARK'
    ? 'text-gray-400 hover:bg-slate-800 hover:text-gray-100'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 ${isActive ? activeClass : inactiveClass}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? '' : 'opacity-70'}`} />
      {label}
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { settings, colors } = useTheme();

  const navItems = [
    { view: 'DASHBOARD' as ViewState, label: 'Overview', icon: LayoutDashboard },
    { view: 'EGGS' as ViewState, label: 'Track Eggs', icon: Egg },
    { view: 'CUSTOMERS' as ViewState, label: 'Customers', icon: Users },
    { view: 'LEDGER' as ViewState, label: 'Customer Ledger', icon: BookOpen },
    { view: 'EXPENSES' as ViewState, label: 'Expenses', icon: Wallet },
    { view: 'BALANCE_SHEET' as ViewState, label: 'Balance Sheet', icon: Scale },
    { view: 'OUTSTANDING' as ViewState, label: 'Outstanding', icon: AlertCircle },
    { view: 'SETTINGS' as ViewState, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const logoColor = settings.theme === 'FUN' ? 'text-fuchsia-500' : settings.theme === 'DARK' ? 'text-blue-500' : 'text-amber-500';
  const sidebarBg = settings.theme === 'DARK' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const sidebarText = settings.theme === 'DARK' ? 'text-gray-100' : 'text-gray-900';
  const mobileHeaderBg = settings.theme === 'DARK' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${colors.bgPage}`}>
      {/* Mobile Header */}
      <div className={`md:hidden p-4 flex justify-between items-center sticky top-0 z-20 border-b ${mobileHeaderBg}`}>
        <h1 className={`text-xl font-bold flex items-center ${sidebarText}`}>
          <Egg className={`w-6 h-6 mr-2 ${logoColor}`} />
          {settings.farmName}
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 ${colors.textMain}`}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-10 bg-gray-800/50 transition-opacity md:hidden
        ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`
        fixed inset-y-0 left-0 z-20 w-64 border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarBg}
      `}>
        <div className="h-full flex flex-col">
          <div className={`p-6 border-b hidden md:flex items-center ${settings.theme === 'DARK' ? 'border-slate-800' : 'border-gray-200'}`}>
            <Egg className={`w-8 h-8 mr-3 ${logoColor}`} />
            <span className={`text-xl font-bold ${sidebarText}`}>{settings.farmName}</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                current={currentView}
                label={item.label}
                icon={item.icon}
                onClick={handleNavClick}
              />
            ))}
          </nav>
          <div className={`p-4 border-t ${settings.theme === 'DARK' ? 'border-slate-800' : 'border-gray-200'}`}>
            <p className={`text-xs text-center ${settings.theme === 'DARK' ? 'text-slate-500' : 'text-gray-400'}`}>Nova Farms v2.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
