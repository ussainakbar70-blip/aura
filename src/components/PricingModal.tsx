'use client';

import React, { useState } from 'react';
import { 
  X, Check, Zap, Shield, Sparkles, CreditCard, AlertCircle, 
  ExternalLink, Lock, CheckCircle2
} from 'lucide-react';
import { PLANS, PAID_PLAN_IDS, type PlanId } from '@/config/plans';
import type { AccountView } from '@/types';
import { initiateCashfreeCheckout } from '@/lib/cashfree-client';
import { useAuth } from '@/lib/client/auth-context';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export function PricingModal({ isOpen, onClose, onOpenAuth }: PricingModalProps) {
  const { user, account, getToken, refreshAccount } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = account?.plan || 'free';

  const handleCashfreeCheckout = async (planId: PlanId) => {
    setErrorMessage(null);

    // Require sign-in to attach payment to an account
    if (!user) {
      onClose();
      onOpenAuth?.();
      return;
    }

    setLoadingPlan(planId);

    try {
      const token = await getToken();
      if (!token) throw new Error('Session expired. Please sign in again.');

      // 1. Create order on server using production Cashfree credentials
      const res = await fetch('/api/payments/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to initialize Cashfree order.');
      }

      const { paymentSessionId, orderId } = data;

      // 2. Open Cashfree v3 Dropin Modal
      try {
        await initiateCashfreeCheckout(paymentSessionId, true);
      } catch (sdkErr: any) {
        console.warn('[cashfree] Dropin closed or redirected:', sdkErr);
      }

      // 3. Verify order with server and activate
      const verifyRes = await fetch('/api/payments/cashfree/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.paid) {
        setSuccessPlan(PLANS[planId].name);
        await refreshAccount();
        setTimeout(() => {
          setSuccessPlan(null);
          onClose();
        }, 2000);
      } else {
        setErrorMessage(
          verifyData.status === 'ACTIVE'
            ? 'Payment was not completed. If money was debited, your subscription will be activated automatically via webhook.'
            : `Payment status: ${verifyData.status || 'Incomplete'}`
        );
      }
    } catch (err: any) {
      console.error('[pricing] Checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please check network connection.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Aura Production Pricing
              </span>
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Secured by Cashfree PG
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
              Subscription Plans & Fair Usage Policy
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              30-day access with guaranteed monthly compute credits and strict daily limits.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successPlan && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">
              Payment confirmed! Upgraded to {successPlan} with fresh credits.
            </span>
          </div>
        )}

        {/* Tier Cards Grid */}
        <div className="p-6 space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAID_PLAN_IDS.map((planId) => {
              const plan = PLANS[planId];
              const isCurrent = currentPlan === planId;
              const isHighlight = plan.highlight;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                    isHighlight
                      ? 'bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-amber-500/40 shadow-xl shadow-amber-500/5'
                      : isCurrent
                      ? 'bg-zinc-900/70 border-emerald-500/40'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="mt-4 pb-4 border-b border-zinc-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          ${plan.priceUSD}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">/month</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        ₹{plan.priceINR} INR (Cashfree PG)
                      </div>
                    </div>

                    {/* FUP & Economics box */}
                    <div className="my-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/70 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400">Monthly Budget:</span>
                        <span className="font-bold text-amber-300">
                          {plan.monthlyCredits} credits
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400">Daily FUP Cap:</span>
                        <span className="font-semibold text-emerald-400">
                          {plan.dailyRequestLimit} req / day ({plan.dailyCreditCap} cr)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400">Max Output Capacity:</span>
                        <span className="font-mono text-zinc-300">
                          {(plan.maxOutputTokens / 1000).toFixed(0)}k tokens / build
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Included Features
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start gap-2 text-xs text-zinc-300"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscribe action */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleCashfreeCheckout(planId)}
                      disabled={isCurrent || loadingPlan !== null}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isCurrent
                          ? 'bg-zinc-800 text-zinc-500 cursor-default'
                          : isHighlight
                          ? 'bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {loadingPlan === planId ? (
                        <span>Connecting to Cashfree...</span>
                      ) : isCurrent ? (
                        <span>Current Active Plan</span>
                      ) : !user ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Sign In to Subscribe</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Subscribe with Cashfree</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fair Usage Policy Explanation */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Fair Usage Policy (FUP):</span> Every generation is measured against actual compute token consumption and deducted from your monthly credit allowance. Daily limits reset every 24 hours at 00:00 UTC to maintain dedicated infrastructure performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
