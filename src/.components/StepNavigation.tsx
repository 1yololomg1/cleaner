import React from 'react';
import { FileText, Settings, Zap, BarChart3, ChevronRight, Check } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
  disabled: boolean;
}

interface StepNavigationProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  completedSteps: string[];
  filesCount: number;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepChange,
  completedSteps,
  filesCount
}) => {
  const steps: Step[] = [
    {
      id: 'upload',
      name: 'Upload Files',
      icon: FileText,
      completed: completedSteps.includes('upload'),
      current: currentStep === 'upload',
      disabled: false
    },
    {
      id: 'standardize',
      name: 'Standardize',
      icon: Settings,
      completed: completedSteps.includes('standardize'),
      current: currentStep === 'standardize',
      disabled: filesCount === 0
    },
    {
      id: 'process',
      name: 'Process',
      icon: Zap,
      completed: completedSteps.includes('process'),
      current: currentStep === 'process',
      disabled: filesCount === 0
    },
    {
      id: 'visualize',
      name: 'Visualize',
      icon: BarChart3,
      completed: completedSteps.includes('visualize'),
      current: currentStep === 'visualize',
      disabled: filesCount === 0
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => !step.disabled && onStepChange(step.id)}
                    disabled={step.disabled}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      step.current
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : step.completed
                        ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                        : step.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step.current
                        ? 'bg-blue-600 text-white'
                        : step.completed
                        ? 'bg-green-600 text-white'
                        : step.disabled
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{step.name}</span>
                      </div>
                    </div>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {filesCount} files loaded
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Ready</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};