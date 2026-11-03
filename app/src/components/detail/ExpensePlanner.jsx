import { expenseLabels, universities } from '../../lib/mockExpenses';

export default function ExpensePlanner({ plan, onChange, estimate, property }) {
  const update = (key, value) => onChange({ ...plan, [key]: value });
  const number = (key, label, max = 10000000) => <label key={key}>{label}
    <input type="number" min="0" max={max} step="1" value={plan[key]} onChange={e => {
      const v = e.target.value;
      if (v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= max && (key !== 'days' || Number.isInteger(Number(v))))) update(key, v);
    }} /></label>;
  return <fieldset className="expense-planner">
    <legend>Your monthly plan</legend>
    {number('budget', 'How much can you spend each month? (KES)')}
    <p className="food-cost__note">Start with your budget, then adjust the categories you need. Travel and everyday costs use editable mock estimates.</p>
    <details className="budget-category">
    <summary><span>Travel to university<small>Return trips based on your campus days</small></span><strong>{estimate.transport === null ? 'Add details' : `KES ${estimate.transport.toLocaleString('en-KE')}/mo`}</strong></summary>
    <div className="budget-category__body">
    <div className="expense-planner__grid">
      <label>Property area (fixed)<input readOnly value={plan.area || property.location || 'Location not available'} /></label>
      <label>Destination university<select value={plan.campus} onChange={e => onChange({ ...plan, campus: e.target.value, fare: '' })}>
        <option value="">Choose university</option>{Object.entries(universities).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select></label>
      {number('days', 'Campus travel days per month', 31)}
      <label>One-way fare override (KES)<input type="number" min="0" max="100000" value={plan.fare} placeholder={estimate.fare === null ? 'Enter fare for another route' : String(estimate.fare)} onChange={e => {
        const v = e.target.value;
        if (v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100000)) update('fare', v);
      }} /></label>
    </div>
    <p>Transport: {estimate.transport === null ? 'Enter a fare for this property to the selected university' : `KES ${estimate.transport.toLocaleString('en-KE')}/month (${estimate.fare} × 2 trips × ${plan.days} days)`}</p>
    <p className="food-cost__note">Fares are mock estimates for the campus branches shown. Enter zero if you walk.</p>
    </div></details>
    <details className="budget-category">
    <summary><span>Everyday expenses<small>Utilities, groceries and personal spending</small></span><strong>Review estimates</strong></summary>
    <div className="budget-category__body">
    <div className="expense-planner__grid">{Object.entries(expenseLabels).map(([key, label]) => {
      const included = ['water','wifi','garbage'].includes(key) && [true,1,'1'].includes(property[`${key}_included`]);
      return included ? <p key={key}>{label}: included in rent (KES 0 extra)</p> : number(key, `${label} (KES/month)`);
    })}</div>
    </div></details>
    <details className="budget-category"><summary><span>Move-in costs<small>One-time charges, separate from your monthly total</small></span></summary>
    <div className="budget-category__body"><p>Deposit: {property.security_deposit == null ? 'not provided' : `KES ${Number(property.security_deposit).toLocaleString('en-KE')}`}</p><p>Booking fee: {property.booking_fee == null ? 'not provided' : `KES ${Number(property.booking_fee).toLocaleString('en-KE')}`}</p></div></details>
    <p className="food-cost__note">For walking, enter a zero fare. For other areas or campus branches, enter your own fare. Avoid counting food, data or other costs in more than one category. Blank expense fields leave the estimate incomplete.</p>
  </fieldset>;
}
