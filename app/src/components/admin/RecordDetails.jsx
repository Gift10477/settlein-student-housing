export default function RecordDetails({ record }) {
  return <dl className="record-details">{Object.entries(record).map(([key, value]) => <div key={key}>
    <dt>{key.replaceAll('_', ' ')}</dt>
    <dd>{value === null || value === undefined || value === '' ? 'Not specified' : typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
  </div>)}</dl>;
}
