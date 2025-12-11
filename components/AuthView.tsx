import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await StorageService.login(email, password);
      } else {
        if (!name) throw new Error("Name is required");
        user = await StorageService.register(email, password, name);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-900/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight mb-2">BreatheThrough</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">Enterprise Health Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-900/30 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3.5 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-700 text-sm"
                placeholder="Name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3.5 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-700 text-sm"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3.5 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-700 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-4 rounded-xl transition-all shadow-lg shadow-sky-900/30 disabled:opacity-50 disabled:cursor-wait mt-2 tracking-wide"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-zinc-500 text-xs font-medium hover:text-sky-400 transition-colors"
          >
            {isLogin ? "New user? Create an account" : "Existing user? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;