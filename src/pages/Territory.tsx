import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Map, Save, AlertCircle, Plus } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../utils/api';

export default function Territory({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unsaved, setUnsaved] = useState(false);
  const [options, setOptions] = useState({ cartoes: [], locais: [], dirigentes: [], grupos: [], bairros: [] });
  
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const formatWeek = () => {
    if (isSameMonth(start, end)) {
      return `${format(start, 'dd')} - ${format(end, 'dd MMM', { locale: ptBR })}`;
    }
    return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM', { locale: ptBR })}`;
  };
  
  const weekKey = format(start, 'yyyy-MM-dd');
  
  // 4 columns
  const [coverage, setCoverage] = useState<any[]>([
    { id: 1, grupo_id: '', turno: '', local_id: '', bairro_id: '', cartao_id: '', dirigentes: [] },
    { id: 2, grupo_id: '', turno: '', local_id: '', bairro_id: '', cartao_id: '', dirigentes: [] },
    { id: 3, grupo_id: '', turno: '', local_id: '', bairro_id: '', cartao_id: '', dirigentes: [] },
    { id: 4, grupo_id: '', turno: '', local_id: '', bairro_id: '', cartao_id: '', dirigentes: [] }
  ]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/cartoes'),
      api.get('/admin/locais'),
      api.get('/admin/dirigentes'),
      api.get('/admin/grupos'),
      api.get('/admin/bairros')
    ]).then(([cartoes, locais, dirigentes, grupos, bairros]) => {
      setOptions({ cartoes, locais, dirigentes, grupos, bairros });
    });
  }, []);

  useEffect(() => {
    api.get(`/schedule/territory/${weekKey}`).then(data => {
      if (data.length > 0) {
        const newCov = [...coverage];
        data.forEach((d: any, i: number) => {
          if (newCov[i]) {
            newCov[i] = { 
              ...newCov[i], 
              grupo_id: d.grupo_id || '',
              turno: d.turno || '',
              local_id: d.local_id || '',
              bairro_id: d.bairro_id || '',
              cartao_id: d.cartao_id || '',
              dirigentes: d.dirigentes_json ? JSON.parse(d.dirigentes_json) : []
            };
          }
        });
        setCoverage(newCov);
      } else {
        setCoverage(coverage.map(c => ({ ...c, grupo_id: '', turno: '', local_id: '', bairro_id: '', cartao_id: '', dirigentes: [] })));
      }
      setUnsaved(false);
    });
  }, [weekKey]);

  const handleChange = (index: number, field: string, value: any) => {
    const newCov = [...coverage];
    newCov[index][field] = value;
    setCoverage(newCov);
    setUnsaved(true);
  };

  const addDirigente = (index: number) => {
    const newCov = [...coverage];
    newCov[index].dirigentes.push({ id: '', start: '', end: '' });
    setCoverage(newCov);
    setUnsaved(true);
  };

  const updateDirigente = (colIndex: number, dirIndex: number, field: string, value: string) => {
    const newCov = [...coverage];
    newCov[colIndex].dirigentes[dirIndex][field] = value;
    setCoverage(newCov);
    setUnsaved(true);
  };

  const handleSave = async () => {
    await api.post(`/schedule/territory/${weekKey}`, { coverage });
    setUnsaved(false);
    alert('Cobertura salva com sucesso!');
  };

  return (
    <>
      <TopBar 
        title="Cobertura do Território" 
        icon={<Map size={24} />} 
        toggleSidebar={toggleSidebar}
        weekRange={formatWeek()}
        onPrevWeek={() => setCurrentDate(subWeeks(currentDate, 1))}
        onNextWeek={() => setCurrentDate(addWeeks(currentDate, 1))}
      />
      
      <div className="schedule-container">
        <div className="font-semibold text-[0.8rem] uppercase tracking-wider text-[var(--color-secondary)] mb-2">CARTÕES SUGERIDOS PARA PROGRAMAÇÃO DURANTE A SEMANA</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {coverage.map((col, i) => (
            <div key={col.id} className="table-card p-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--color-secondary)] uppercase">Grupo</label>
                <select className="select-mock font-bold" value={col.grupo_id} onChange={e => handleChange(i, 'grupo_id', e.target.value)}>
                  <option value="">Selecionar Grupo</option>
                  {options.grupos.map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--color-secondary)] uppercase">Turno</label>
                <select className="select-mock" value={col.turno} onChange={e => handleChange(i, 'turno', e.target.value)}>
                  <option value="">Selecionar...</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--color-secondary)] uppercase">Local de Saída</label>
                <select className="select-mock" value={col.local_id} onChange={e => handleChange(i, 'local_id', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {options.locais.map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--color-secondary)] uppercase">Bairro</label>
                <select className="select-mock" value={col.bairro_id} onChange={e => handleChange(i, 'bairro_id', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {options.bairros.map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--color-secondary)] uppercase">Cartão</label>
                <select className="select-mock" value={col.cartao_id} onChange={e => handleChange(i, 'cartao_id', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {options.cartoes.map((g: any) => <option key={g.id} value={g.id}>{g.codigo}</option>)}
                </select>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-main)]">
                <label className="block text-xs font-semibold mb-2 text-[var(--color-secondary)] uppercase">Dirigentes</label>
                {col.dirigentes.map((dir: any, dIndex: number) => (
                  <div key={dIndex} className="bg-[#F9FBFC] p-3 rounded border border-[var(--color-border-main)] mb-2">
                    <select className="select-mock mb-2" value={dir.id} onChange={e => updateDirigente(i, dIndex, 'id', e.target.value)}>
                      <option value="">Selecionar Dirigente...</option>
                      {options.dirigentes.map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input type="date" className="select-mock text-xs flex-1" value={dir.start} onChange={e => updateDirigente(i, dIndex, 'start', e.target.value)} />
                      <input type="date" className="select-mock text-xs flex-1" value={dir.end} onChange={e => updateDirigente(i, dIndex, 'end', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button className="btn-secondary w-full justify-center text-sm py-1.5 mt-1 flex items-center gap-1" onClick={() => addDirigente(i)}>
                  <Plus size={14} /> Adicionar Dirigente
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer-actions">
        {unsaved && (
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> Alterações não salvas serão perdidas ao sair.
          </div>
        )}
        {unsaved && <button className="btn-secondary" onClick={() => setUnsaved(false)}>Descartar</button>}
        <button className="btn-primary" style={{ padding: '10px 32px' }} onClick={handleSave}>
          <Save size={18} /> Salvar Cobertura
        </button>
      </footer>
    </>
  );
}