'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/app/actions/admin-auth';
import { Eye, EyeOff, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Password is required.');
      return;
    }

    startTransition(async () => {
      const result = await loginAdmin(password);
      if (result.success) {
        router.push('/a145');
        router.refresh();
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Title / Logo Area */}
        <div className="text-center mb-8">
          <span className="text-sm font-extrabold tracking-widest text-orange-500 uppercase">
            Sports Shop Control Panel
          </span>
          <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
            Administrator Access
          </h1>
          <p className="text-slate-400 text-xs mt-2">
            Please enter your management password to continue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isPending}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-[10px] text-slate-600">
          Authorized staff only. Session authentication expires in 30 days.
        </div>
      </div>
    </div>
  );
}
