import React from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { FileInfo } from './components/Dashboard/FileInfo';
import { MultiTrackVisualization } from './components/Dashboard/MultiTrackVisualization';
import { AdvancedProcessingControls } from './components/Processing/AdvancedProcessingControls';
import { ComprehensiveQCDashboard } from './components/QC/ComprehensiveQCDashboard';
import { ExportModal } from './components/Export/ExportModal';
import { PaymentModal } from './components/Export/PaymentModal';
import { FormatConverter } from './components/Export/FormatConverter';
import { AuthModal } from './components/Auth/AuthModal';
import { HelpModal } from './components/Help/HelpModal';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Top Row - File Info and Multi-Track Visualization */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[500px]">
            <div className="xl:col-span-4 2xl:col-span-3">
              <FileInfo />
            </div>
            <div className="xl:col-span-8 2xl:col-span-9">
              <MultiTrackVisualization />
            </div>
          </div>
          
          {/* Bottom Row - Processing Controls and QC Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[600px]">
            <div>
              <AdvancedProcessingControls />
            </div>
            <div>
              <ComprehensiveQCDashboard />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal />
      <ExportModal />
      <PaymentModal />
      <FormatConverter />
      <HelpModal />
    </div>
  );
}

export default App;