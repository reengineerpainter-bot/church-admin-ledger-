import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, Sparkles } from 'lucide-react';

export function LoginScreen({ onLogin, users }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both your username and password.');
      return;
    }

    setLoading(true);
    // Add small delay to simulate server authentication latency
    setTimeout(() => {
      const res = onLogin(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
      }
    }, 600);
  };

  const handleQuickFill = (uName, role) => {
    setUsername(uName);
    const matchedUser = users?.find(u => u.username.toLowerCase() === uName.toLowerCase());
    setPassword(matchedUser?.tempPassword || 'password');
    setError('');
  };

  // Select a few core users representing each tier to list for quick-testing
  const demoAccounts = [
    { name: 'Pastor Chris', username: 'pastorchris', role: 'admin', desc: 'Zonal Pastor (L1)' },
    { name: 'GP Samuel', username: 'gpsamuel', role: 'group_pastor', desc: 'Group Pastor (L2)' },
    { name: 'P Matthew', username: 'pmatthew', role: 'pastor', desc: 'Pastor (L3)' },
    { name: 'CL David', username: 'cldavid', role: 'chapter_leader', desc: 'Grace Chapter Leader (L4)' },
    { name: 'Cell Leader Mary', username: 'marycell', role: 'cell_leader', desc: 'Joy Cell Leader (L5)' },
    { name: 'Member John', username: 'memberjohn', role: 'member', desc: 'Active Member (L6)' }
  ];

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 p-5 sm:p-8 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-5 sm:gap-6">
      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 items-center justify-center text-indigo-400 mb-3 shadow-inner">
          <Lock size={26} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-wide uppercase">Authenticate Credentials</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Log in with your secure account credentials to access your administrative workspace.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. chris"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none transition-colors font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-850 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={14} />
              Access Dashboard
            </>
          )}
        </button>
      </form>

      {/* Simulator helper card */}
      <div className="border-t border-slate-850 pt-5 mt-2">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={11} className="text-indigo-400" />
          Simulation Accounts Reference (Auto-Fill)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {demoAccounts.map(acct => (
            <button
              key={acct.username}
              type="button"
              onClick={() => handleQuickFill(acct.username, acct.role)}
              className="p-2.5 bg-slate-950 border border-slate-850 hover:border-indigo-500/30 text-left rounded-xl transition-all hover:scale-[1.01]"
            >
              <span className="font-bold text-slate-200 block truncate">{acct.name}</span>
              <span className="text-indigo-400 block truncate">@{acct.username}</span>
              <span className="text-slate-500 block truncate text-[9px] mt-0.5">{acct.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
