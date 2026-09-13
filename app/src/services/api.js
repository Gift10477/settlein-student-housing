/**
 * api.js — SettleIn API Client & Data Layer
 *
 * Communicates directly with the Express / MySQL backend server at http://localhost:5000/api
 */

const API_BASE = 'http://localhost:5000/api';

/* ─────────────────────────────────────────────────────────────
 * 1. PROPERTIES (SELECT, INSERT, UPDATE, DELETE)
 * ───────────────────────────────────────────────────────────── */

/**
 * SELECT: Fetch all properties from MySQL with optional filtering
 */
export async function getProperties(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.campus && filters.campus !== 'all') params.append('campus', filters.campus);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = `${API_BASE}/properties${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch properties (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('getProperties fetch error:', err);
    throw err;
  }
}

/**
 * SELECT: Fetch a single property by ID from MySQL
 */
export async function getPropertyById(id) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch property details (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`getPropertyById(${id}) error:`, err);
    throw err;
  }
}

/**
 * INSERT: Add a new property into MySQL database
 */
export async function addProperty(propertyData) {
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('addProperty error:', err);
    throw err;
  }
}

/**
 * UPDATE: Update an existing property in MySQL database
 */
export async function updateProperty(id, updateData) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`updateProperty(${id}) error:`, err);
    throw err;
  }
}

/**
 * DELETE: Delete a property from MySQL database
 */
export async function deleteProperty(id) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`deleteProperty(${id}) error:`, err);
    throw err;
  }
}

/* ─────────────────────────────────────────────────────────────
 * 2. USERS (SELECT, INSERT, UPDATE, DELETE)
 * ───────────────────────────────────────────────────────────── */

/**
 * SELECT: Fetch all users from MySQL
 */
export async function getUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getUsers error:', err);
    throw err;
  }
}

/**
 * SELECT: Fetch a single user by ID
 */
export async function getUserById(id) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`getUserById(${id}) error:`, err);
    throw err;
  }
}

/**
 * INSERT: Add a new user into MySQL
 */
export async function addUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('addUser error:', err);
    throw err;
  }
}

/**
 * UPDATE: Update an existing user in MySQL
 */
export async function updateUser(id, userData) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`updateUser(${id}) error:`, err);
    throw err;
  }
}

/**
 * DELETE: Delete a user from MySQL
 */
export async function deleteUser(id) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`deleteUser(${id}) error:`, err);
    throw err;
  }
}

/* ─────────────────────────────────────────────────────────────
 * 3. AUTHENTICATION & SESSION MANAGEMENT
 * ───────────────────────────────────────────────────────────── */

const USER_SESSION_KEY = 'settlein_active_user';

/**
 * Register a new user account into MySQL and log them in
 */
export async function registerUser({ name, email, password, role = 'student', campus = 'strathmore' }) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const res = await addUser({ name, email, role, campus });
    const user = {
      id: res.user_id || `user-${Date.now()}`,
      name,
      email,
      role,
      campus
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return {
      success: true,
      message: 'Account created and saved to MySQL database!',
      user,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Failed to create account.',
    };
  }
}

/**
 * Log in an existing user from the MySQL database
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.error || 'Invalid credentials or account not found.',
      };
    }

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data.user));
    return {
      success: true,
      message: data.message || 'Signed in successfully!',
      user: data.user,
    };
  } catch (err) {
    // If offline, fallback to locally cached user if matching
    const cached = getCurrentUser();
    if (cached && cached.email === email) {
      return { success: true, message: 'Signed in successfully (local session)!', user: cached };
    }
    return {
      success: false,
      message: 'Unable to connect to database server. Please ensure the server is running.',
    };
  }
}

/**
 * Get currently authenticated user from session
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the current user session
 */
export function logoutUser() {
  localStorage.removeItem(USER_SESSION_KEY);
}

/* ─────────────────────────────────────────────────────────────
 * 4. SAVED PROPERTIES / FAVORITES
 * ───────────────────────────────────────────────────────────── */

const SAVED_KEY = 'settlein_saved_properties';

/**
 * Get array of saved property IDs
 */
export function getSavedPropertyIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a property ID is saved
 */
export function isSaved(propId) {
  const saved = getSavedPropertyIds();
  return saved.includes(propId);
}

/**
 * Toggle saved status for a property
 */
export function toggleSaved(propId) {
  let saved = getSavedPropertyIds();
  if (saved.includes(propId)) {
    saved = saved.filter(id => id !== propId);
  } else {
    saved.push(propId);
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  return saved.includes(propId);
}
