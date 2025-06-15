import React from 'react';
import { Gem, Settings, FileText, Download, BarChart3, User, CreditCard, RefreshCw, HelpCircle, LogOut } from 'lucide-react';
import { useAppStore } from '../../store';

export const Header: React.FC = () => {
  const { user, setShowAuthModal, setShowFormatConverter, setShowHelpModal, setUser } = useAppStore();

  const handleReports = () => {
    // Generate and download a comprehensive report
    console.log('Generating comprehensive report...');
    // This would typically generate a PDF report of all processed files
  };

  const handleSettings = () => {
    // Open settings modal (would need to be implemented)
    console.log('Opening settings...');
    // This would open user preferences, processing defaults, etc.
  };

  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700 px-6 py-4 shadow-lg h-20">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gem className="h-10 w-10 text-amber-400" />
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">POLISH</h1>
              <p className="text-sm text-blue-200 font-medium">
                Petrophysical Operations for Log Intelligence, Smoothing and Harmonization
              </p>
              <p className="text-xs text-slate-400 italic">
                Professional-grade petrophysical data preprocessing platform
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowFormatConverter(true)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Convert LAS files to other formats"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium">Format Converter</span>
          </button>
          
          <button 
            onClick={handleReports}
            className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Generate comprehensive processing reports"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Reports</span>
          </button>
          
          <button 
            onClick={handleSettings}
            className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Application settings and preferences"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Help and documentation"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Help</span>
          </button>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-400 rounded-lg border border-purple-700/50">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">{user.credits} Credits</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-900/30 to-green-900/30 text-emerald-400 rounded-lg border border-emerald-700/50">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Sign In</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-900/30 to-green-900/30 text-emerald-400 rounded-lg border border-emerald-700/50">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-sm font-medium">System Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};