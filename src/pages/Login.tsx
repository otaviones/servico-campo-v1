import React, { useState } from 'react';
import { useAuth } from '../utils/auth';
import { api } from '../utils/api';
import { Calendar } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F5F7FA]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E1E8ED] w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-[#3E5C76]">
          <Calendar size={48} className="mb-4" />
          <h1 className="text-2xl font-bold">Serviço de Campo</h1>
          <p className="text-[#6B8299]">Acesse sua conta</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#1F2D3A]">Usuário</label>
            <input 
              type="text" 
              className="w-full p-2 border border-[#E1E8ED] rounded focus:outline-none focus:border-[#3E5C76]"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#1F2D3A]">Senha</label>
            <input 
              type="password" 
              className="w-full p-2 border border-[#E1E8ED] rounded focus:outline-none focus:border-[#3E5C76]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}