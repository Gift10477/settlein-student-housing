import { useState } from 'react';
import { filterReport, reportColumns, reportCSV } from '../../services/reports';
const titles = { bookings: 'Reservations', payments: 'Payments', properties: 'Listings', users: 'Users', logs: 'Audit trail' };
export default function ReportsView({ data }) {
  const [kind, setKind] = useState('bookings'), [query, setQuery] = useState(''), [status, setStatus] = useState('all'), [from, setFrom] = useState(''), [to, setTo] = useState(''), [sort, setSort] = useState('newest');
  const rows = filterReport(data[kind] || [], { query, status, from, to, sort });
  const columns = reportColumns[kind], generated = new Date().toLocaleString('en-KE');
  function download() { const url = URL.createObjectURL(new Blob(['\uFEFF' + reportCSV(columns, rows, titles[kind])], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href=url; link.download=`settlein-${kind}-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url); }
  const statuses = [...new Set((data[kind] || []).map(row => row.status || row.review_status || row.role).filter(Boolean))];
  return <div className="reports-workspace"><div className="portal-toolbar report-controls">
    <label>Report<select value={kind} onChange={e=>{setKind(e.target.value);setStatus('all');}}>{Object.entries(titles).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label>Search<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All</option>{statuses.map(value=><option key={value}>{value}</option>)}</select></label>
    <label>Created from<input type="date" value={from} max={to || undefined} onChange={e=>setFrom(e.target.value)}/></label>
    <label>Created through<input type="date" value={to} min={from || undefined} onChange={e=>setTo(e.target.value)}/></label>
    <label>Sort<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name / reference</option></select></label>
    <button onClick={download}>Download CSV</button><button onClick={()=>window.print()}>Print / Save PDF</button>
  </div><section className="report-document" aria-label="Report preview"><header className="report-brand"><svg aria-label="SettleIn logo" role="img" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10 12 3 21 10v11H3z M9 21V13h6v8"/></svg><div><h2>SettleIn</h2><p>Student housing management</p></div></header><h3>{titles[kind]} report</h3><p>Generated: {generated} · {rows.length} records</p><p>Period: {from || 'Beginning'} to {to || 'Today'} · Status: {status} · Search: {query || 'All'} · Sort: {sort}</p>
    {kind==='payments' && <p>Total recorded: KES {rows.reduce((sum,row)=>sum+Number(row.amount || 0),0).toLocaleString()}</p>}
    <div className="report-scroll"><table><thead><tr>{columns.map(key=><th key={key}>{key.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}>{columns.map(key=><td key={key}>{String(row[key]??'—')}</td>)}</tr>)}</tbody></table></div>{!rows.length&&<p>No records match these filters.</p>}<footer>SettleIn · Internal report · Mock and manual payments; no live payment gateway</footer>
  </section></div>;
}
