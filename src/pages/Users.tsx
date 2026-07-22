import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Users as UsersIcon, Edit, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

export default function Users({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({ username: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = () => {
    api.get(`/admin/users`).then(setUsers).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/users/${editingId}`, formData);
    } else {
      await api.post(`/admin/users`, formData);
    }
    loadData();
    setFormData({ username: '', password: '', role: 'user' });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await api.delete(`/admin/users/${id}`);
      loadData();
    }
  };

  return (
    <>
      <TopBar title="Gerenciar Usuários" icon={<UsersIcon size={24} />} toggleSidebar={toggleSidebar} />
      
      <div className="schedule-container bg-white">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 max-w-sm">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-main)]">Usuário</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-[var(--color-border-main)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-main)]">Senha</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-[var(--color-border-main)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-main)]">Perfil</label>
                <select 
                  className="w-full p-2 border border-[var(--color-border-main)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                {editingId && (
                  <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => { setEditingId(null); setFormData({ username: '', password: '', role: 'user' }); }}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-4">Lista de Usuários</h3>
            <div className="border border-[var(--color-border-main)] rounded-lg overflow-hidden">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th className="w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-500 py-8">Nenhum registro encontrado.</td></tr>
                  ) : users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(user.id); setFormData(user); }} className="text-blue-600 p-1">
                            <Edit size={16} />
                          </button>
                          {user.username !== 'admin' && (
                            <button onClick={() => handleDelete(user.id)} className="text-red-600 p-1">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}