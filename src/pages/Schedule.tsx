import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { Calendar, Save, AlertCircle } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../utils/api';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function Schedule({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unsaved, setUnsaved] = useState(false);
  
  const [schedule, setSchedule] = useState<any[]>(
    DAYS.map(day => ({ day, time: '', cartao_id: '', local_id: '', dirigente_id: '' }))
  );
  
  const [options, setOptions] = useState({ cartoes: [], locais: [], dirigentes: [] });

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const formatWeek = () => {
    if (isSameMonth(start, end)) {
      return `${format(start, 'dd')} - ${format(end, 'dd MMM', { locale: ptBR })}`;
    }
    return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM', { locale: ptBR })}`;
  };
  
  const weekKey = format(start, 'yyyy-MM-dd');

  useEffect(() => {
    // Load options
    Promise.all([
      api.get('/admin/cartoes'),
      api.get('/admin/locais'),
      api.get('/admin/dirigentes')
    ]).then(([cartoes, locais, dirigentes]) => {
      setOptions({ cartoes, locais, dirigentes });
    });
  }, []);

  useEffect(() => {
    // Load schedule
    api.get(`/schedule/week/${weekKey}`).then(data => {
      if (data.length > 0) {
        const newSched = DAYS.map(day => {
          const found = data.find((d: any) => d.day === day);
          return found ? { ...found, cartao_id: found.cartao_id || '', local_id: found.local_id || '', dirigente_id: found.dirigente_id || '' } : { day, time: '', cartao_id: '', local_id: '', dirigente_id: '' };
        });
        setSchedule(newSched);
      } else {
        setSchedule(DAYS.map(day => ({ day, time: '', cartao_id: '', local_id: '', dirigente_id: '' })));
      }
      setUnsaved(false);
    });
  }, [weekKey]);

  const handleChange = (index: number, field: string, value: string) => {
    const newSched = [...schedule];
    newSched[index][field] = value;
    setSchedule(newSched);
    setUnsaved(true);
  };

  const handleSave = async () => {
    await api.post(`/schedule/week/${weekKey}`, { schedule });
    setUnsaved(false);
    alert('Programação salva com sucesso!');
  };

  return (
    <>
      <TopBar 
        title="Programação da Semana" 
        icon={<Calendar size={24} />} 
        toggleSidebar={toggleSidebar}
        weekRange={formatWeek()}
        onPrevWeek={() => setCurrentDate(subWeeks(currentDate, 1))}
        onNextWeek={() => setCurrentDate(addWeeks(currentDate, 1))}
        onExport={() => {
          import('html2canvas').then(html2canvas => {
            const el = document.getElementById('schedule-export');
            if (el) {
              html2canvas.default(el).then(canvas => {
                const link = document.createElement('a');
                link.download = 'programacao.png';
                link.href = canvas.toDataURL();
                link.click();
              });
            }
          });
        }}
      />
      
      <div className="schedule-container" id="schedule-export">
        <div className="table-card">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Dia da Semana</th>
                <th>Hora</th>
                <th>Cartão / Território</th>
                <th>Local de Saída</th>
                <th>Dirigente</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={row.day}>
                  <td className="day-cell">{row.day}</td>
                  <td>
                    <input 
                      type="time" 
                      className="time-input w-24 text-sm" 
                      value={row.time} 
                      onChange={e => handleChange(i, 'time', e.target.value)} 
                    />
                  </td>
                  <td>
                    <select className="select-mock" value={row.cartao_id} onChange={e => handleChange(i, 'cartao_id', e.target.value)}>
                      <option value="">Selecione...</option>
                      {options.cartoes.map((c: any) => <option key={c.id} value={c.id}>{c.codigo}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="select-mock" value={row.local_id} onChange={e => handleChange(i, 'local_id', e.target.value)}>
                      <option value="">Selecione...</option>
                      {options.locais.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="select-mock" value={row.dirigente_id} onChange={e => handleChange(i, 'dirigente_id', e.target.value)}>
                      <option value="">Selecione...</option>
                      {options.dirigentes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <Save size={18} /> Salvar Programação
        </button>
      </footer>
    </>
  );
}