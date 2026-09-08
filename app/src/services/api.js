const API_BASE = 'http://localhost:5000/api';



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

    const qs = params.toString();
    const url = `${API_BASE}/properties${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getProperties fetch error:', err);
    throw err;
  }
}

/**
 * SELECT: Fetch a single property by ID
 */
export async function getPropertyById(id) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`getPropertyById(${id}) error:`, err);
    throw err;
  }
}

/**
 * INSERT: Add a new property into MySQL
 */
export async function addProperty(propertyData) {
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('addProperty error:', err);
    throw err;
  }
}

/**
 * UPDATE: Update an existing property in MySQL
 */
export async function updateProperty(id, updateData) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`updateProperty(${id}) error:`, err);
    throw err;
  }
}



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
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`getUserById(${id}) error:`, err);
    throw err;
  }
}

/**
 * INSERT: Add / register a new user in MySQL
 */
export async function addUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
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
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`updateUser(${id}) error:`, err);
    throw err;
  }
}
