import { useEffect, useState } from 'react';
import { getMarketPrices } from '../../services/api';
import { calculateLivingCosts, foodLineCost, marketAreas, matchMarketArea, filterMarketPrices } from '../../lib/livingCosts';
import './FoodCostWidget.css';

const money = (amount) => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', maximumFractionDigits: 2,
}).format(amount);

export default function FoodCostWidget({ rent, propertyCounty, location }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [county, setCounty] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [otherCosts, setOtherCosts] = useState('');

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
    setQuantities({}); setCounty(null); setAttempt((value) => value + 1);
  };
  const prices = result?.prices || [];
  const counties = marketAreas(prices, propertyCounty);
  const selectedArea = county ?? matchMarketArea(counties, propertyCounty, location);
  const visible = filterMarketPrices(prices, selectedArea);
  const { food, hasBasket, rentKnown, other, total } = calculateLivingCosts(visible, quantities, rent, otherCosts);

  return (
    <section className="food-cost" aria-labelledby="food-cost-title">
      <header className="food-cost__header">
        <div><span className="food-cost__eyebrow">Plan your monthly budget</span>
          <h3 id="food-cost-title">Food & living cost estimate</h3></div>
        <span className="food-cost__badge">Shamba Direct prices</span>
      </header>
      <p className="food-cost__intro">Compare food prices for the accommodation's area, then enter monthly quantities to estimate food costs alongside this room's rent.</p>
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
          <label>Food market area (county)
            <select value={selectedArea} onChange={(event) => { setCounty(event.target.value); setQuantities({}); }}>
              <option value="">Choose an area</option>
              {counties.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <p>Accommodation: <strong>{location || propertyCounty || 'Location not provided'}</strong>. Prices are county-level, not street or estate estimates.</p>
        </div>
        {!selectedArea && <p role="status">{counties.length ? 'Select the accommodation county to see its food prices and estimate monthly living costs.' : 'These prices have no county information. An area-specific estimate is not available yet.'}</p>}
        {selectedArea && visible.length === 0 && <p role="status">No food market prices are available for {selectedArea}. Choose another area to compare; it will not represent this location.</p>}
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
        <label className="food-cost__extras">Other monthly costs (KES)
          <input type="number" min="0" max="10000000" step="1" inputMode="decimal" placeholder="Utilities, transport, and other groceries"
            value={otherCosts} onChange={(event) => {
              const value = event.target.value;
              if (value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 10000000)) setOtherCosts(value);
            }} />
        </label>
        <dl className="food-cost__summary">
          <div><dt>Monthly rent</dt><dd>{rentKnown ? money(Number(rent)) : 'Not available'}</dd></div>
          <div><dt>Food basket in {selectedArea}</dt><dd>{hasBasket ? money(food) : 'Choose quantities'}</dd></div>
          <div><dt>Other monthly costs</dt><dd>{money(other)}</dd></div>
          <div className="food-cost__total"><dt>Estimated monthly total</dt><dd>{hasBasket && rentKnown ? money(total) : '—'}</dd></div>
        </dl>
        <p className="food-cost__note">Estimate only, based on your quantities and entered costs. Includes no deposit, booking fee, delivery charges, or unentered expenses. These crops alone may not cover a complete diet. Prices can change.</p>
        </>}
        <p className="food-cost__source">Source: {result.source} · Fetched {new Date(result.fetched_at).toLocaleString('en-KE')}. Currency: KES (partner confirmation pending).</p>
      </>}
    </section>
  );
}
