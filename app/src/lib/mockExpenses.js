// Synthetic KES fares, one way. Columns: Strathmore, UoN main, KU main, JKUAT Juja.
export const universities = { strathmore: 'Strathmore — Madaraka', uon: 'UoN — main campus', ku: 'KU — main campus', jkuat: 'JKUAT — Juja' };
export const transportAreas = [
  ['Madaraka Estate', [30, 60, 140, 180]], ['Nairobi West', [30, 60, 140, 180]],
  ['South B', [50, 70, 150, 190]], ['South C', [50, 80, 160, 200]],
  ['Langata', [60, 90, 170, 210]], ['KMA', [60, 90, 170, 210]],
  ['Highrise', [40, 70, 150, 190]], ['Mbagathi Way', [40, 70, 150, 190]],
  ['Ngara', [70, 40, 100, 140]], ['Parklands', [80, 50, 110, 150]],
  ['Upper Hill', [40, 50, 130, 170]], ['Kilimani', [70, 70, 150, 190]],
  ['Hurlingham', [60, 60, 140, 180]], ['Juja', [180, 150, 70, 30]],
  ['Thika Road — Nairobi section', [120, 90, 80, 120]],
  ['Thika Road — Kiambu section', [150, 120, 60, 90]],
  ['Strathmore Hostels (On-Campus)', [0, 60, 140, 180]],
  ['Ngando', [90, 100, 180, 220]], ['KU main campus area', [150, 120, 30, 80]],
];
export const expenseLabels = {
  electricity: 'Electricity', water: 'Water', wifi: 'Wi-Fi', garbage: 'Garbage collection',
  cookingFuel: 'Cooking fuel', mobileData: 'Phone / mobile data', toiletries: 'Toiletries / cleaning',
  laundry: 'Laundry', study: 'Study / printing', extraGroceries: 'Groceries outside selected food basket',
  healthcare: 'Healthcare allowance', leisure: 'Personal / leisure', contingency: 'Contingency', other: 'Other expenses',
};
export const defaultExpenses = { electricity: 700, water: 300, wifi: 1000, garbage: 150,
  cookingFuel: 500, mobileData: 500, toiletries: 400, laundry: 300, study: 300,
  extraGroceries: 1000, healthcare: 300, leisure: 500, contingency: 500, other: 0 };
export function initialExpensePlan(location = '', campus = '') {
  const parts = location.split(',').map(x => x.trim().toLowerCase());
  const area = transportAreas.find(([name]) => parts.includes(name.toLowerCase()))?.[0] || '';
  return { area, campus: universities[campus] ? campus : '', days: 22, fare: '', budget: '', ...defaultExpenses };
}
const amount = x => x !== '' && x !== null && x !== undefined && Number.isFinite(Number(x)) && Number(x) >= 0 ? Number(x) : null;
export function estimateExpenses(plan, property = {}) {
  const row = transportAreas.find(([name]) => name === plan.area);
  const index = Object.keys(universities).indexOf(plan.campus);
  const fare = plan.fare === '' ? (row && index >= 0 ? row[1][index] : null) : amount(plan.fare);
  const days = amount(plan.days);
  const transport = fare !== null && days !== null ? fare * 2 * days : null;
  const costs = Object.fromEntries(Object.keys(expenseLabels).map(key => {
    const included = ['water', 'wifi', 'garbage'].includes(key) && [true, 1, '1'].includes(property[`${key}_included`]);
    return [key, included ? 0 : amount(plan[key])];
  }));
  const complete = transport !== null && Object.values(costs).every(x => x !== null);
  return { fare, transport, costs, complete, total: complete ? transport + Object.values(costs).reduce((a,b) => a+b,0) : null };
}
