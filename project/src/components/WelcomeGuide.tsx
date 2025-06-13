import React from 'react';
import { FileText, Settings, Zap, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

interface WelcomeGuideProps {
  onGetStarted: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onGetStarted }) => {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Upload LAS Files",
      description: "Drop your well log files and we'll parse them automatically",
      details: "Supports multiple files, validates format, extracts curves and metadata"
    },
    {
      number: 2,
      icon: Settings,
      title: "Standardize Data",
      description: "Automatic mnemonic mapping and unit conversion",
      details: "Smart recognition of service company naming conventions"
    },
    {
      number: 3,
      icon: Zap,
      title: "Clean & Process",
      description: "Apply industry-standard cleaning algorithms",
      details: "Despiking, smoothing, gap filling, and rock physics validation"
    },
    {
      number: 4,
      icon: BarChart3,
      title: "Visualize & QC",
      description: "Generate professional plots and quality control reports",
      details: "20+ visualization types, multi-well comparison, export options"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WellLog Pro
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Enterprise Well Log Data Processing Platform
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Professional-grade LAS file processing with intelligent standardization, 
            advanced cleaning algorithms, and comprehensive visualization tools.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {step.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {step.details}
                  </p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-blue-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Smart Standardization</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Automatic mnemonic recognition</li>
              <li>• Service company mapping</li>
              <li>• Unit conversion & validation</li>
              <li>• Confidence scoring</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Processing</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Rock physics validation</li>
              <li>• Intelligent despiking</li>
              <li>• Environmental corrections</li>
              <li>• Quality assurance</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Professional Output</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 20+ visualization types</li>
              <li>• Multi-well comparison</li>
              <li>• Comprehensive reports</li>
              <li>• Industry-standard export</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="mr-2">Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            No registration required • Client-side processing • Secure & private
          </p>
        </div>
      </div>
    </div>
  );
};