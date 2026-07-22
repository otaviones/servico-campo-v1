import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

const TABS = [
  { id: 'dirigentes', label: 'Dirigentes', fields: ['nome'] },
  { id: 'locais', label: 'Locais de Saída', fields: ['nome'] },
  { id: 'grupos', label: 'Grupos', fields: ['nome'] },
  { id: 'bairros', label: 'Bairros', fields: ['nome'] },
  { id: 'cartoes', label: 'Cartões', fields: ['codigo'] }
];

export default function Records({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = () => {
    api.get(`/admin/${activeTab.id}`).then(setItems).catch(console.error);
  };

  useEffect(() => {
    loadData();
    setFormData({});
    setEditingId(null);
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/${activeTab.id}/${editingId}`, formData);
    } else {
      await api.post(`/admin/${activeTab.id}`, formData);
    }
    loadData();
    setFormData({});
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await api.delete(`/admin/${activeTab.id}/${id}`);
      loadData();
    }
  };

  return (
    <>
      <TopBar title="Cadastros" icon={<Settings size={24} />} toggleSidebar={toggleSidebar} />
      
      <div className="schedule-container bg-white">
        <div className="flex border-b border-[var(--color-border-main)] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold text-sm whitespace-nowrap ${
                activeTab.id === tab.id 
                  ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'text-[var(--color-secondary)] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <div className="flex-1 max-w-sm">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Editar' : 'Novo'} {activeTab.label}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab.fields.map(field => (
                <div key={field}>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-main)] capitalize">{field}</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-[var(--color-border-main)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                    value={formData[field] || ''}
                    onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div className="flex gap-2">
                {editingId && (
                  <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => { setEditingId(null); setFormData({}); }}>
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
            <h3 className="font-bold text-lg mb-4">Lista de {activeTab.label}</h3>
            <div className="border border-[var(--color-border-main)] rounded-lg overflow-hidden">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {activeTab.fields.map(f => <th key={f}>{f}</th>)}
                    <th className="w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-gray-500 py-8">Nenhum registro encontrado.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      {activeTab.fields.map(f => <td key={f}>{item[f]}</td>)}
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(item.id); setFormData(item); }} className="text-blue-600 p-1">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 p-1">
                            <Trash2 size={16} />
                          </button>
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