import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, Star } from 'lucide-react';
import { useAppStore } from '../../store';

export const PaymentModal: React.FC = () => {
  const { showPaymentModal, setShowPaymentModal, setUser } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [processing, setProcessing] = useState(false);

  if (!showPaymentModal) return null;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful payment - create user account
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'user@example.com',
      name: 'Demo User',
      credits: 10,
      subscription: 'free' as const,
      preferences: {
        processingDefaults: {},
        visualizationDefaults: {},
        mnemonicStandard: 'api' as const,
        colorScheme: 'default' as const,
        autoSave: true,
        notifications: true
      }
    };
    
    setUser(mockUser);
    setProcessing(false);
    setShowPaymentModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Secure Payment</h3>
                <p className="text-sm text-slate-400">Premium export payment</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Pricing */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">LAS Export + Report</span>
              <span className="text-2xl font-bold text-white">$400</span>
            </div>
            <p className="text-sm text-slate-300">Includes processing certificate, QC report, and professional documentation</p>
            
            {/* Volume Pricing Info */}
            <div className="mt-3 pt-3 border-t border-green-700/30">
              <p className="text-xs text-slate-400 mb-2">Volume pricing available:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-white font-bold">$350</p>
                  <p className="text-slate-400">50+ files</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">$300</p>
                  <p className="text-slate-400">100+ files</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-bold">Custom</p>
                  <p className="text-slate-400">Enterprise</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Payment Method</h4>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3 rounded-lg border transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit/Debit Card</span>
                </div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`w-full p-3 rounded-lg border transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  <span>PayPal</span>
                </div>
              </button>
            </div>
          </div>

          {/* Card Form (if card selected) */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Secure Payment</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>256-bit SSL encryption</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>PCI DSS compliant</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>No subscription required</span>
              </li>
            </ul>
          </div>

          {/* Bonus Credits */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Bonus: Get 5 Conversion Credits</span>
            </div>
            <p className="text-xs text-slate-400">
              First-time users receive 5 free format conversion credits ($50 value) for CSV, Excel, JSON, and more
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/20">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay $400</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};