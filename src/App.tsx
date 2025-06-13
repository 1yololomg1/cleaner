import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { WelcomeGuide } from './components/WelcomeGuide.tsx';
import { StepNavigation } from './components/StepNavigation.tsx';
import { FileUpload } from './components/FileUpload.tsx';
import { AlgorithmGroups } from './components/AlgorithmGroups.tsx';
import { DataProcessor } from './components/DataProcessor.tsx';
import { SimpleVisualizer } from './components/SimpleVisualizer.tsx';
import { LASFile } from './types/wellLog.ts';

type TabType = 'upload' | 'standardize' | 'process' | 'visualize';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [files, setFiles] = useState<LASFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<LASFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LASFile>();
  const [algorithms, setAlgorithms] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleFilesUploaded = (newFiles: LASFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0 && !selectedFile) {
      setSelectedFile(newFiles[0]);
    }
    setCompletedSteps(prev => [...prev, 'upload']);
    setActiveTab('standardize');
  };

  const handleAlgorithmsChanged = (newAlgorithms: any[]) => {
    setAlgorithms(newAlgorithms);
    if (newAlgorithms.some(alg => alg.enabled)) {
      setCompletedSteps(prev => [...prev, 'standardize'].filter((v, i, a) => a.indexOf(v) === i));
    }
  };

  const handleProcessingComplete = (processed: LASFile[]) => {
    setProcessedFiles(processed);
    setCompletedSteps(prev => [...prev, 'process'].filter((v, i, a) => a.indexOf(v) === i));
    setActiveTab('visualize');
  };

  const handleStepChange = (step: string) => {
    setActiveTab(step as TabType);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload onFilesUploaded={handleFilesUploaded} />;
      case 'standardize':
        return (
          <AlgorithmGroups 
            onAlgorithmsChanged={handleAlgorithmsChanged}
            onProceedToProcess={() => setActiveTab('process')}
          />
        );
      case 'process':
        return (
          <DataProcessor
            files={files}
            algorithms={algorithms}
            onProcessingComplete={handleProcessingComplete}
          />
        );
      case 'visualize':
        return (
          <SimpleVisualizer
            files={processedFiles.length > 0 ? processedFiles : files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        );
      default:
        return null;
    }
  };

  if (showWelcome) {
    return <WelcomeGuide onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WellLog Pro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Enterprise Data Processing</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowWelcome(true)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Guide
            </button>
          </div>
        </div>
      </header>

      {/* Step Navigation */}
      <StepNavigation
        currentStep={activeTab}
        onStepChange={handleStepChange}
        completedSteps={completedSteps}
        filesCount={files.length}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {getTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;