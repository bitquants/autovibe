'use client';

import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeCardElementOptions } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#71717a',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
    },
  },
  hidePostalCode: true,
};

interface CardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CardForm({ onSuccess, onCancel }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a setup intent on the server
      const response = await fetch('/api/billing/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardholderName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent');
      }

      // Confirm the card setup
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Failed to save card');
      }

      if (setupIntent.status === 'succeeded') {
        setSuccess(true);
        onSuccess?.();
      } else {
        throw new Error('Card setup did not complete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <h4 className="text-[14px] font-medium text-green-400 mb-1">
          Card Added Successfully
        </h4>
        <p className="text-[12px] text-green-400/70">
          Your payment method has been saved for future billing.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cardholder Name */}
      <div>
        <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2.5 rounded-md bg-[#27272a] border border-[#3f3f46] text-[#fafafa] text-[13px] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50 transition-colors"
          disabled={isLoading}
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
          Card Information
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CreditCard className="w-4 h-4 text-[#71717a]" />
          </div>
          <div className="pl-10 pr-3 py-2.5 rounded-md bg-[#27272a] border border-[#3f3f46] focus-within:border-cyan-400/50 transition-colors">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
        <p className="text-[11px] text-[#71717a] mt-1.5 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Your card information is securely encrypted
        </p>
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-md text-[12px] font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 py-2.5 rounded-md text-[12px] font-medium bg-cyan-400 text-[#18181b] hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Card'}
        </button>
      </div>
    </form>
  );
}

interface StripeCardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StripeCardForm({ onSuccess, onCancel }: StripeCardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

// Component to display saved payment methods
interface SavedCardProps {
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
  onRemove?: () => void;
  onSetDefault?: () => void;
}

export function SavedCard({
  last4,
  brand,
  expMonth,
  expYear,
  isDefault,
  onRemove,
  onSetDefault,
}: SavedCardProps) {
  const getCardIcon = () => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-[#1a1f71] rounded flex items-center justify-center text-[8px] text-white font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 rounded flex items-center justify-center text-[8px] font-bold overflow-hidden">
            <span className="text-[#eb001b]">●</span>
            <span className="text-[#f79e1b] ml-0.5">●</span>
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-[#016fd0] rounded flex items-center justify-center text-[6px] text-white font-bold">
            AMEX
          </div>
        );
      default:
        return <CreditCard className="w-5 h-5 text-[#71717a]" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50">
      <div className="flex items-center gap-3">
        {getCardIcon()}
        <div>
          <p className="text-[13px] font-medium text-[#fafafa]">
            •••• {last4}
          </p>
          <p className="text-[11px] text-[#71717a]">
            Expires {expMonth.toString().padStart(2, '0')}/{expYear}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isDefault ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
            Default
          </span>
        ) : (
          <button
            onClick={onSetDefault}
            className="text-[11px] text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            Set Default
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
