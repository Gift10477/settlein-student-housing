import { useEffect, useState, useId } from 'react';
import { getMarketPrices } from '../../services/api';
import { calculateLivingCosts, foodLineCost, marketAreas, matchMarketArea, filterMarketPrices } from '../../lib/livingCosts';
import './FoodCostWidget.css';
import ExpensePlanner from './ExpensePlanner';
import { initialExpensePlan, estimateExpenses } from '../../lib/mockExpenses';

const money = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', maximumFractionDigits: 2,
}).format(amount);

export default function FoodCostWidget(props) {
  const [expanded, setExpanded] = useState(false);
  const [started, setStarted] = useState(false);
  const panelId = useId();
  return <section className="budget-invitation">
    <div className="budget-invitation__header">
      <div className="budget-invitation__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h2m4 0h2m-8 5h2m4 0h2"/></svg>
      </div>
      <div className="budget-invitation__copy"><span className="food-cost__eyebrow">Make room for your plans</span>
        <h3>Will this home fit your budget?</h3>
        <p>Add food, travel and everyday costs to see your monthly estimate.</p>
      </div>
      <button type="button" className={`btn${expanded ? ' btn--gray' : ''}`} aria-expanded={expanded} aria-controls={panelId} onClick={() => { setStarted(true); setExpanded(!expanded); }}>
        {expanded ? 'Hide budget planner' : started ? 'Continue planning' : 'Plan my monthly budget'}
      </button>
    </div>
    <p className="budget-invitation__optional">Optional · Your booking does not require a budget plan.</p>
    <div id={panelId} hidden={!expanded}>{started && <BudgetCalculator {...props} />}</div>
  </section>;
}

function BudgetCalculator({ rent, propertyCounty, location, property = {}, selectedCampus = '' }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [plan, setPlan] = useState(() => initialExpensePlan(location, selectedCampus));
  const expenses = estimateExpenses(plan, property);

  useEffect(() => {
    const controller = new AbortController();
    getMarketPrices({ signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult(data); })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setError(failure.message);
          setRetryAfter(failure.retryAfter);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const reload = () => {
    setLoading(true); setError(''); setResult(null); setRetryAfter(null);
    setQuantities({}); setAttempt((value) => value + 1);
  };
  const prices = result?.prices || [];
  const counties = marketAreas(prices, propertyCounty);
  const selectedArea = matchMarketArea(counties, propertyCounty, location);
  const visible = filterMarketPrices(prices, selectedArea);
  const { food, hasBasket, rentKnown, other, total } = calculateLivingCosts(visible, quantities, rent, expenses.total);
  const complete = hasBasket && rentKnown && expenses.complete;

  return (
    <div className="food-cost">
      <ExpensePlanner plan={plan} onChange={setPlan} estimate={expenses} property={property} />
      <header className="food-cost__header"><h4>Your food basket</h4><span className="food-cost__badge">Shamba Direct prices</span></header>
      <p className="food-cost__intro">Enter the kilograms you expect to buy each month. Prices are matched to this property's county.</p>
      {loading && <p role="status">Loading market prices…</p>}
      {!loading && error && <div role="status" className="food-cost__message">
        <p>{error}</p>
        {retryAfter && <p>Try again in approximately {retryAfter} seconds.</p>}
        <button type="button" className="btn btn--gray" onClick={reload}>Try again</button>
      </div>}
      {!loading && !error && prices.length === 0 && <div className="food-cost__message" role="status">
        <p>No market prices are available yet. Your accommodation details are still available.</p>
        <button type="button" className="btn btn--gray" onClick={reload}>Check again</button>
      </div>}
      {!loading && !error && prices.length > 0 && <>
        <div className="food-cost__controls">
          <label>Property county (fixed)
            <input readOnly value={selectedArea || 'County not available'} />
          </label>
          <p>Accommodation: <strong>{location || propertyCounty || 'Location not provided'}</strong>. Prices are county-level, not street or estate estimates.</p>
        </div>
        {!selectedArea && <p role="status">The property county could not be confirmed from its details. A local food estimate is unavailable until the property location is updated.</p>}
        {selectedArea && visible.length === 0 && <p role="status">No food market prices are available for this property's county, {selectedArea}. A local food estimate is unavailable.</p>}
        {visible.length > 0 && <>
        <p className="food-cost__area-result" role="status">Showing {visible.length} crop {visible.length === 1 ? 'price' : 'prices'} for <strong>{selectedArea}</strong>.</p>
        <div className="food-cost__table-wrap">
          <table className="food-cost__table"><thead><tr>
            <th scope="col">Crop / market</th><th scope="col">Price per kg</th><th scope="col">Kg per month</th><th scope="col">Monthly cost</th>
          </tr></thead><tbody>
            {visible.map((row) => <tr key={row.id}>
              <th scope="row">{row.crop_name}<small>{row.county || 'County not provided'}</small></th>
              <td>{money(row.price_per_kg)}</td>
              <td><input aria-label={`Monthly kilograms of ${row.crop_name} from ${row.county || 'an unspecified county'}`}
                type="number" min="0" max="1000" step="0.1" inputMode="decimal" placeholder="0"
                value={quantities[row.id] ?? ''} onChange={(event) => {
                  const value = event.target.value;
                  if (value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000)) {
                    setQuantities((previous) => ({ ...previous, [row.id]: value }));
                  }
                }} /></td>
              <td>{money(foodLineCost(row.price_per_kg, quantities[row.id]))}</td>
            </tr>)}
          </tbody></table>
        </div>
        <dl className="food-cost__summary">
          <div><dt>Monthly rent</dt><dd>{rentKnown ? money(Number(rent)) : 'Not available'}</dd></div>
          <div><dt>Food basket in {selectedArea}</dt><dd>{hasBasket ? money(food) : 'Choose quantities'}</dd></div>
          <div><dt>Transport & other expenses</dt><dd>{expenses.complete ? money(other) : 'Complete expense inputs'}</dd></div>
          <div className="food-cost__total"><dt>Estimated monthly total</dt><dd>{complete ? money(total) : 'Incomplete'}</dd></div>
        </dl>
        {complete && plan.budget !== '' && <p role="status">{Number(plan.budget) >= total ? `Within budget by ${money(Number(plan.budget) - total)}` : `Over budget by ${money(total - Number(plan.budget))}`}</p>}
        <p className="food-cost__note">Estimate only, based on your quantities and entered costs. Includes no deposit, booking fee, delivery charges, or unentered expenses. These crops alone may not cover a complete diet. Prices can change.</p>
        </>}
        <p className="food-cost__source">Source: {result.source} · Fetched {new Date(result.fetched_at).toLocaleString('en-KE')}. Currency: KES (partner confirmation pending).</p>
      </>}
    </div>
  );
}
