/**
 * db.js — SettleIn data layer
 *
 /

/** The localStorage key for all app data */
const DB_KEY = 'settlein_db_v3';


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
      whatsapp: '+254 712 000 001',
      latitude: -1.3000,
      longitude: 36.8160,
      security_deposit: 14500,
      booking_fee: 2000,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'],
      video_url: '',
      vacant_units: 2,
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
      whatsapp: '+254 712 000 002',
      latitude: -1.3050,
      longitude: 36.8200,
      security_deposit: 8500,
      booking_fee: 1000,
      water_included: true,
      wifi_included: false,
      garbage_included: true,
      gender_policy: 'Female-only',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'],
      video_url: '',
      vacant_units: 5,
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
      whatsapp: '+254 712 000 003',
      latitude: -1.1820,
      longitude: 36.9270,
      security_deposit: 18000,
      booking_fee: 3000,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'],
      video_url: '',
      vacant_units: 1,
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
      whatsapp: '+254 712 000 004',
      latitude: -1.2650,
      longitude: 36.8150,
      security_deposit: 0,
      booking_fee: 500,
      water_included: true,
      wifi_included: true,
      garbage_included: false,
      gender_policy: 'Male-only',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'],
      video_url: '',
      vacant_units: 12,
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
      whatsapp: '+254 712 000 005',
      latitude: -1.0950,
      longitude: 37.0150,
      security_deposit: 24000,
      booking_fee: 5000,
      water_included: false,
      wifi_included: false,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'],
      video_url: '',
      vacant_units: 3,
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
      whatsapp: '+254 712 000 006',
      latitude: -1.2670,
      longitude: 36.8000,
      security_deposit: 19500,
      booking_fee: 2500,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80'],
      video_url: '',
      vacant_units: 0,
      reviews: [
        { name: 'Grace N.', stars: 5, comment: 'The rooftop view is stunning. Great place to unwind after class.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-007',
      title: 'Nairobi Heights Hostel',
      type: 'Single Room',
      price: 12000,
      location: 'CBD, Nairobi',
      campus: 'uon',
      distance: '0.8km · University of Nairobi',
      verified: true,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80',
      amenities: ['Wi-Fi', 'CCTV', 'Hot Shower'],
      description: 'Secure single rooms right in the city center. Perfect for UoN students who want zero commute.',
      landlord: 'City Center Hostels',
      phone: '+254 712 000 007',
      whatsapp: '+254 712 000 007',
      latitude: -1.2820,
      longitude: 36.8190,
      security_deposit: 12000,
      booking_fee: 1500,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Male-only',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80'],
      video_url: '',
      vacant_units: 0,
      reviews: [],
      savedBy: [],
    },
    {
      id: 'prop-008',
      title: 'Strathview Executive Studios',
      type: 'Studio',
      price: 25000,
      location: 'Madaraka Estate, Nairobi',
      campus: 'strathmore',
      distance: '0.1km · Strathmore University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=600&q=80',
      amenities: ['Wi-Fi', 'Biometric', 'Gym', 'Parking', 'CCTV'],
      description: 'High-end studio apartments directly opposite Strathmore. Features premium finishing and state-of-the-art security.',
      landlord: 'Strathview Properties',
      phone: '+254 712 000 008',
      whatsapp: '+254 712 000 008',
      latitude: -1.3040,
      longitude: 36.8150,
      security_deposit: 50000,
      booking_fee: 5000,
      water_included: true,
      wifi_included: false,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1501183638710-841dd1904471?w=600&q=80'],
      video_url: '',
      vacant_units: 1,
      reviews: [
        { name: 'John D.', stars: 5, comment: 'Literally steps away from the gate. Very secure.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-009',
      title: 'Kenyatta Scholars Village',
      type: 'Hostel Room',
      price: 9000,
      location: 'Kahawa Sukari, Nairobi',
      campus: 'ku',
      distance: '0.5km · Kenyatta University',
      verified: false,
      image: 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80',
      amenities: ['Wi-Fi', 'Laundry', 'Study Room'],
      description: 'A vibrant community of students. Basic but comfortable hostel rooms with a massive shared study hall.',
      landlord: 'Scholars Village Mgt',
      phone: '+254 712 000 009',
      whatsapp: '+254 712 000 009',
      latitude: -1.1850,
      longitude: 36.9300,
      security_deposit: 9000,
      booking_fee: 1000,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=600&q=80'],
      video_url: '',
      vacant_units: 5,
      reviews: [],
      savedBy: [],
    },
    {
      id: 'prop-010',
      title: 'The Oasis Residences',
      type: 'Bedsitter',
      price: 13500,
      location: 'Juja, Kiambu',
      campus: 'jkuat',
      distance: '1.0km · JKUAT',
      verified: true,
      image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=80',
      amenities: ['Wi-Fi', 'Borehole', 'Balcony', 'CCTV'],
      description: 'Quiet, serene female-only bedsitters with a strict no-noise policy. Ideal for focused students.',
      landlord: 'Oasis Homes',
      phone: '+254 712 000 010',
      whatsapp: '+254 712 000 010',
      latitude: -1.1000,
      longitude: 37.0100,
      security_deposit: 13500,
      booking_fee: 2000,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Female-only',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=80'],
      video_url: '',
      vacant_units: 2,
      reviews: [
        { name: 'Mary W.', stars: 5, comment: 'Very peaceful environment.' },
      ],
      savedBy: [],
    },
    {
      id: 'prop-011',
      title: 'Silver Oaks Shared Flats',
      type: 'Shared Apartment',
      price: 16000,
      location: 'South C, Nairobi',
      campus: 'strathmore',
      distance: '2.5km · Strathmore University',
      verified: true,
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
      amenities: ['Wi-Fi', 'Parking', 'Hot Shower'],
      description: 'A bit further from campus but offers massive rooms. Shared living spaces and kitchen.',
      landlord: 'Silver Oaks Ltd',
      phone: '+254 712 000 011',
      whatsapp: '+254 712 000 011',
      latitude: -1.3150,
      longitude: 36.8250,
      security_deposit: 16000,
      booking_fee: 3000,
      water_included: false,
      wifi_included: true,
      garbage_included: false,
      gender_policy: 'Mixed',
      furnishing_status: 'Unfurnished',
      images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80'],
      video_url: '',
      vacant_units: 0,
      reviews: [],
      savedBy: [],
    },
    {
      id: 'prop-012',
      title: 'City Center Premium Dorms',
      type: 'Hostel Room',
      price: 15000,
      location: 'CBD, Nairobi',
      campus: 'uon',
      distance: '0.4km · University of Nairobi',
      verified: true,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
      amenities: ['Wi-Fi', 'CCTV', 'Study Room', 'Elevator', 'Gym'],
      description: 'Premium dormitory living with everything you need under one roof. Games room, gym, and high-speed fiber internet.',
      landlord: 'Premium Dorms Ke',
      phone: '+254 712 000 012',
      whatsapp: '+254 712 000 012',
      latitude: -1.2800,
      longitude: 36.8200,
      security_deposit: 0,
      booking_fee: 5000,
      water_included: true,
      wifi_included: true,
      garbage_included: true,
      gender_policy: 'Mixed',
      furnishing_status: 'Furnished',
      images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
      video_url: '',
      vacant_units: 10,
      reviews: [
        { name: 'Peter M.', stars: 4, comment: 'Great facilities but sometimes a bit noisy.' },
      ],
      savedBy: [],
    }
  ],
  /** Landlord-submitted listings waiting for review */
  pendingListings: [],
  /** Currently logged-in user (or null) */
  currentUser: null,
  /** All registered users */
  users: [],
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
  if (filters.gender_policy && filters.gender_policy !== 'all') {
    props = props.filter(p => p.gender_policy === filters.gender_policy);
  }
  if (filters.furnishing_status && filters.furnishing_status !== 'all') {
    props = props.filter(p => p.furnishing_status === filters.furnishing_status);
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

/**
 * registerUser — create a new user account
 * @param {object} user - { name, email, password, role }
 * @returns {object} { success: boolean, message: string, user?: object }
 */
export function registerUser({ name, email, password, role }) {
  const db = getDB();
  db.users = db.users || [];

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  if (db.users.find(u => u.email === email)) {
    return { success: false, message: 'Email is already registered.' };
  }

  const newUser = { id: `user-${Date.now()}`, name, email, password, role };
  db.users.push(newUser);
  db.currentUser = newUser;
  saveDB(db);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

/**
 * loginUser — authenticate an existing user
 * @param {string} email
 * @param {string} password
 * @returns {object} { success: boolean, message: string, user?: object }
 */
export function loginUser(email, password) {
  const db = getDB();
  db.users = db.users || [];

  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  db.currentUser = user;
  saveDB(db);
  return { success: true, message: 'Signed in successfully!', user };
}

/**
 * getCurrentUser — get the active session user
 * @returns {object|null}
 */
export function getCurrentUser() {
  const db = getDB();
  return db.currentUser || null;
}

/**
 * logoutUser — clear the active session
 */
export function logoutUser() {
  const db = getDB();
  db.currentUser = null;
  saveDB(db);
}
