/**
 * db.js — SettleIn data layer
 *
 * Handles all localStorage reads/writes and provides the
 * initial seed dataset. Every function is a pure utility —
 * no React dependency — so it can be used anywhere.
 */

/** The localStorage key for all app data */
const DB_KEY = 'settlein_db';

/** ────────────────────────────────────────────────
 *  Seed data — 6 verified student properties with real images
 *  ──────────────────────────────────────────────── */
const SEED_DATA = {
  properties: [
    {
      id: 'prop-001',
      title: 'Apex Student Executive Suites',
      type: 'Bedsitter',
      price: 14500,
      location: 'Kilimani, Nairobi',
      campus: 'strathmore',
      distance: '0.4km · Strathmore University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
      amenities: ['Wi-Fi', 'CCTV', 'Borehole', 'Parking'],
      description: 'Modern en-suite bedsitters in a quiet compound. 24/7 security and reliable water supply. Ideal for Strathmore University students.',
      landlord: 'Apex Properties Ltd',
      phone: '+254 712 000 001',
      reviews: [
        { name: 'Alice M.', stars: 5, comment: 'Clean, safe, and close to campus. Highly recommend!' },
        { name: 'Brian O.', stars: 4, comment: 'Good Wi-Fi speed. Compound is well-lit at night.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-002',
      title: 'Madaraka Scholar Residence',
      type: 'Hostel Room',
      price: 8500,
      location: 'Madaraka Estate, Nairobi',
      campus: 'strathmore',
      distance: '0.2km · Strathmore University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
      amenities: ['Biometric', 'Borehole', 'Study Room', 'Laundry'],
      description: 'Affordable hostel rooms right next to campus. Biometric access control, communal study room, and laundry facilities included.',
      landlord: 'Scholar Homes Kenya',
      phone: '+254 712 000 002',
      reviews: [
        { name: 'Carol N.', stars: 5, comment: 'Best value near campus. Study room is great!' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-003',
      title: 'Ngando Legacy Hall',
      type: 'Shared Apartment',
      price: 18000,
      location: 'Ngando, Nairobi',
      campus: 'ku',
      distance: '0.8km · Kenyatta University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      amenities: ['Wi-Fi', 'Hot Shower', 'Balcony', 'CCTV', 'Gym'],
      description: 'Premium shared apartments with stunning city views. Each unit has a private balcony, hot shower, and access to a shared gym.',
      landlord: 'Legacy Real Estate',
      phone: '+254 712 000 003',
      reviews: [],
      savedBy: [],
    },
    {
      id: 'prop-004',
      title: 'Parklands View Hostel',
      type: 'Single Room',
      price: 7500,
      location: 'Parklands, Nairobi',
      campus: 'uon',
      distance: '0.6km · University of Nairobi',
      verified: true,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
      amenities: ['Wi-Fi', 'Security', 'Water 24/7', 'Common Kitchen'],
      description: 'Comfortable single rooms in a secure compound near UoN. All-inclusive pricing covers water and electricity.',
      landlord: 'Parklands Hostels Ltd',
      phone: '+254 712 000 004',
      reviews: [
        { name: 'David K.', stars: 4, comment: 'Very convenient location and friendly management.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-005',
      title: 'Juja Garden Apartments',
      type: '2-Bedroom',
      price: 24000,
      location: 'Juja Town, Kiambu',
      campus: 'jkuat',
      distance: '0.3km · JKUAT',
      verified: true,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      amenities: ['Wi-Fi', 'Parking', 'Generator', 'Balcony', 'CCTV'],
      description: 'Spacious 2-bedroom apartments perfect for sharing with a classmate. Modern kitchen, reliable internet, and backup generator for uninterrupted study.',
      landlord: 'Juja Garden Properties',
      phone: '+254 712 000 005',
      reviews: [
        { name: 'Esther W.', stars: 5, comment: 'Love the generator — no more power cuts during exams!' },
        { name: 'Felix O.', stars: 5, comment: 'Spacious and well-maintained. Worth every shilling.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-006',
      title: 'Westlands Studio Flats',
      type: 'Bedsitter',
      price: 19500,
      location: 'Westlands, Nairobi',
      campus: 'strathmore',
      distance: '1.2km · Strathmore University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
      amenities: ['Wi-Fi', 'Gym', 'Rooftop', 'Hot Shower', 'Elevator'],
      description: 'Stylish studio flats in the heart of Westlands. Access to a rooftop terrace and gym. Walking distance to Strathmore and great restaurants.',
      landlord: 'Westlands Living',
      phone: '+254 712 000 006',
      reviews: [
        { name: 'Grace N.', stars: 5, comment: 'The rooftop view is stunning. Great place to unwind after class.' },
      ],
      savedBy: [],
    },
  ],
  /** Landlord-submitted listings waiting for review */
  pendingListings: [],
  /** Currently logged-in user (or null) */
  currentUser: null,
};

/**
 * getDB — read the full database from localStorage.
 * Falls back to seed data on first run.
 * @returns {object} The full database object
 */
export function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge seed images in case localStorage has old data without images
      const seedMap = Object.fromEntries(SEED_DATA.properties.map(p => [p.id, p]));
      parsed.properties = (parsed.properties ?? []).map(p =>
        p.image ? p : { ...p, image: seedMap[p.id]?.image ?? '' }
      );
      // Add any new seed properties not yet in localStorage
      const existingIds = new Set(parsed.properties.map(p => p.id));
      SEED_DATA.properties.forEach(sp => {
        if (!existingIds.has(sp.id)) parsed.properties.push(sp);
      });
      return parsed;
    }
    return { ...SEED_DATA };
  } catch {
    return { ...SEED_DATA };
  }
}

/**
 * saveDB — persist the entire database to localStorage.
 * @param {object} db - The database object to save
 */
export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/**
 * initDB — ensure the database exists; seed it if not.
 * Call once on app startup.
 */
export function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    saveDB(SEED_DATA);
  }
}

/**
 * getProperties — return all listings (optionally filtered).
 * @param {object} filters - Optional filter criteria
 * @returns {Array} Filtered array of property objects
 */
export function getProperties(filters = {}) {
  const db = getDB();
  let props = db.properties ?? [];

  if (filters.campus && filters.campus !== 'all') {
    props = props.filter(p => p.campus === filters.campus);
  }
  if (filters.type && filters.type !== 'all') {
    props = props.filter(p => p.type.toLowerCase().includes(filters.type.toLowerCase()));
  }
  if (filters.maxPrice) {
    props = props.filter(p => p.price <= filters.maxPrice);
  }
  if (filters.amenities?.length) {
    props = props.filter(p => filters.amenities.every(a => p.amenities.includes(a)));
  }
  if (filters.verified) {
    props = props.filter(p => p.verified);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    props = props.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }
  return props;
}

/**
 * getPropertyById — find a single property by its id.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getPropertyById(id) {
  return getDB().properties?.find(p => p.id === id);
}

/**
 * toggleSaved — add/remove a property from a user's saved list.
 * @param {string} propId - Property id
 * @param {string} userId - User identifier (email)
 */
export function toggleSaved(propId, userId = 'guest') {
  const db = getDB();
  const prop = db.properties?.find(p => p.id === propId);
  if (!prop) return;
  const idx = prop.savedBy.indexOf(userId);
  if (idx === -1) prop.savedBy.push(userId);
  else prop.savedBy.splice(idx, 1);
  saveDB(db);
}

/**
 * isSaved — check if a property is saved by a user.
 * @param {string} propId
 * @param {string} userId
 * @returns {boolean}
 */
export function isSaved(propId, userId = 'guest') {
  return getPropertyById(propId)?.savedBy?.includes(userId) ?? false;
}

/**
 * addReview — push a review onto a property.
 * @param {string} propId
 * @param {{name:string, stars:number, comment:string}} review
 */
export function addReview(propId, review) {
  const db = getDB();
  const prop = db.properties?.find(p => p.id === propId);
  if (prop) {
    prop.reviews.push(review);
    saveDB(db);
  }
}

/**
 * addPendingListing — store a landlord-submitted property for review.
 * @param {object} listing
 */
export function addPendingListing(listing) {
  const db = getDB();
  db.pendingListings = db.pendingListings ?? [];
  db.pendingListings.push({ ...listing, id: `pending-${Date.now()}` });
  saveDB(db);
}
