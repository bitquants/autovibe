'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, Star, AlertCircle } from 'lucide-react';
import { StripeCardForm } from './StripeCardForm';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/billing/payment-methods');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }

      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`/api/billing/payment-methods?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove payment method');
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default payment method');
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-10 h-6 bg-[#1a1f71] rounded flex items-center justify-center text-[10px] text-white font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold overflow-hidden bg-white">
            <span className="text-[#eb001b]">●</span>
            <span className="text-[#f79e1b] ml-0.5">●</span>
          </div>
        );
      case 'amex':
        return (
          <div className="w-10 h-6 bg-[#016fd0] rounded flex items-center justify-center text-[8px] text-white font-bold">
            AMEX
          </div>
        );
      case 'discover':
        return (
          <div className="w-10 h-6 bg-[#ff6000] rounded flex items-center justify-center text-[8px] text-white font-bold">
            DISC
          </div>
        );
      default:
        return (
          <div className="w-10 h-6 bg-[#27272a] rounded flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[#71717a]" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-medium text-[#fafafa]">
            Payment Methods
          </h3>
          <p className="text-[12px] text-[#71717a]">
            Manage your saved credit cards
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Add Card Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50">
              <StripeCardForm
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchPaymentMethods();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Methods List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-[#27272a] rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#27272a] rounded w-24" />
                  <div className="h-3 bg-[#27272a] rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="p-6 rounded-lg bg-[#18181b] border border-[#27272a]/50 text-center">
          <div className="w-12 h-12 rounded-full bg-[#27272a] flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-5 h-5 text-[#71717a]" />
          </div>
          <p className="text-[13px] text-[#a1a1aa]">No payment methods saved</p>
          <p className="text-[11px] text-[#71717a] mt-1">
            Add a card to make checkout faster
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50"
            >
              <div className="flex items-center gap-3">
                {getCardIcon(method.brand)}
                <div>
                  <p className="text-[13px] font-medium text-[#fafafa]">
                    •••• {method.last4}
                  </p>
                  <p className="text-[11px] text-[#71717a]">
                    Expires {method.expMonth.toString().padStart(2, '0')}/
                    {method.expYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault ? (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    disabled={actionLoading === method.id}
                    className="text-[11px] px-2 py-0.5 rounded-full text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-50"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  disabled={actionLoading === method.id}
                  className="p-1.5 rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  title="Remove card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
