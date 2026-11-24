import '../admin/Management.css';
const topics = [
  ['Find a room', 'Open Properties. Select your campus, budget, room type, gender policy, furnishing and amenities. A listing must match every selected amenity. Clear filters if no rooms appear.'],
  ['Reserve and pay', 'Sign in, open a property and choose your move-in date, arrival time and lease duration. Submit your reservation, then pay the displayed mock booking fee within 24 hours. Mock payment is a demonstration; no money is transferred.'],
  ['Track your application', 'Open My reservations to see your deadline, payment receipt and application status. Payment does not guarantee a room. An administrator must approve the application while a unit remains available. Overdue unpaid applications can be rejected by the administrator.'],
  ['List a property', 'Register as a landlord. Open For Landlords, enter the property details and select available amenities. Your submission stays private until an administrator approves it. Check the portal for pending, published, unpublished or rejected status.'],
  ['Manage the system', 'Administrators use Admin portal to review listings, record payments with references, approve or reject reservations, manage roles, resolve support messages and view audit history. Reports can be filtered, sorted, downloaded as CSV or printed to PDF.'],
  ['Profile and security', 'Open your Account to update your details and enable an authenticator. Sign out on shared devices. Sessions last one hour; after expiry, sign in again. Password recovery is intentionally not included.'],
  ['Troubleshooting', 'For “Please sign in”, sign in again. For “No verified vacant room remains”, choose another listing. For an overdue fee, contact support with your reservation number. If the server is unavailable, keep your form open and retry later. Do not repeat a payment without checking its status.'],
];
export default function HelpView({ onNavigate }) {
  return <section className="management"><header className="portal-heading"><div><p className="portal-eyebrow">SETTLEIN / HELP</p><h1>How can we help?</h1><p>A guide for students, landlords and administrators.</p></div></header><div className="portal-panel">{topics.map(([title, description]) => <details key={title} className="help-topic"><summary>{title}</summary><p>{description}</p></details>)}<button onClick={() => onNavigate('contact')}>Contact support</button></div></section>;
}
