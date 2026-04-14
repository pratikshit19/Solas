"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, Zap, Check, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function Billing() {
  const [tier, setTier] = useState<'free' | 'sentinel'>('free');
  const [processing, setProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchTier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.tier === 'sentinel') {
        setTier('sentinel');
      }
    };
    fetchTier();
  }, [supabase]);

  const handleUpgrade = async () => {
    setProcessing(true);
    
    try {
      // 1. Create order on the server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 99 }),
      });
      
      const order = await res.json();
      
      if (order.error) throw new Error(order.error);

      // 2. Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      const scriptLoaded = new Promise((resolve) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
      });
      
      document.body.appendChild(script);
      
      if (!await scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 3. Initialize Razorpay widget
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Sbx0j6mqa9EMR0',
        amount: order.amount,
        currency: order.currency,
        name: 'Solas OS',
        description: 'Sentinel Tier Upgrade',
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Update user metadata upon successful payment
          const { error } = await supabase.auth.updateUser({
            data: { tier: 'sentinel' }
          });
          if (error) throw error;
          setTier('sentinel');
          setProcessing(false);
        },
        prefill: {
          email: (await supabase.auth.getUser()).data.user?.email,
        },
        theme: {
          color: '#8b5cf6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description);
        setProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert('Error during checkout: ' + err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-slate-100 flex items-center gap-2">
          <CreditCard size={20} className="text-violet-500 shrink-0" />
          Subscription Protocol
        </h2>
        <p className="text-[12px] md:text-sm text-slate-500 mt-1">Upgrade your cognitive infrastructure with Solas Sentinel.</p>
      </div>

      <div className="max-w-xl w-full">
        <div className="relative p-[1px] overflow-hidden rounded-2xl group transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/50 via-[#18181b] to-indigo-600/50 opacity-50 transition-opacity duration-500"></div>

          <div className="relative bg-[#0c0c0e] rounded-2xl border border-white/5 p-6 sm:p-10 backdrop-blur-xl flex flex-col items-start gap-6 sm:gap-8">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap size={16} className="text-yellow-400 fill-yellow-400/20 flex-shrink-0" />
                  <h3 className="text-base sm:text-xl font-semibold text-white tracking-tight">Solas Sentinel Tier</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Advanced cognitive analysis & infinite memory map functionality.</p>
              </div>
              <div className="text-left sm:text-right flex items-baseline gap-1 sm:block shrink-0">
                <span className="text-2xl sm:text-3xl font-bold text-white">Rs.99</span>
                <span className="text-xs sm:text-sm text-slate-500">/mo</span>
              </div>
            </div>

            <div className="space-y-4 w-full border-t border-white/5 pt-6 md:pt-8">
              <Feature text="Advanced sentiment analysis & memory mapping" />
              <Feature text="Priority access to high-parameter reasoning" />
              <Feature text="Uncapped journal processing and insights" />
              <Feature text="Direct Slack/SMS API integrations" />
            </div>

            {tier === 'sentinel' ? (
              <div className="w-full mt-4 flex items-center justify-center gap-2 p-4 rounded-xl bg-violet-900/20 text-violet-300 border border-violet-500/20 text-sm font-medium shadow-inner shadow-violet-500/10">
                <ShieldCheck size={18} /> Active Subscription Validated
              </div>
            ) : (
              <Button onClick={handleUpgrade} disabled={processing} className="w-full mt-4 bg-white text-black hover:bg-slate-200 h-12 text-sm font-semibold shadow-lg shadow-white/5 transition-all active:scale-[0.98]">
                {processing ? "Launching Secure Checkout..." : "Upgrade System Access"}
              </Button>
            )}

          </div>
        </div>

        <p className="text-[10px] sm:text-[12px] text-slate-500 mt-6 text-center px-4 leading-relaxed">
          {tier === 'sentinel'
            ? "Your encrypted vector database limits are currently uncapped securely by Sentinel."
            : "Payment processing secured by Razorpay. Cancel anytime without data loss."}
        </p>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="mt-1 w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
        <Check size={10} className="text-violet-400" />
      </div>
      <p className="text-[13px] sm:text-base text-slate-300 leading-relaxed">{text}</p>
    </div>
  )
}

