// Deterministic database fixtures for the Week 7 response-contract tests.
// The real Express middleware and routes run; no local MySQL data is changed.
const key = 'week7-test-key-not-for-production';
function setupApi() {
  jest.resetModules();
  process.env.API_KEYS = key;
  const db = require('../db');
  db.query.mockImplementation(async (sql, params = []) => {
    if (sql.includes('INFORMATION_SCHEMA')) return [[]];
    if (sql.includes('FROM users')) return [String(params[0]) === '13' ? [{
      id: 13, name: 'Test Student', email: 'student@example.test', student_id: 'test-13',
      campus: 'strathmore', residence_area: 'Madaraka Estate', course: 'Computing',
      is_verified_student: 1, year_of_study: 3,
    }] : []];
    if (sql.includes('FROM bookings')) return [String(params[0]) === '13' ? [{
      id: 1, user_id: 13, property_title: 'Test Accommodation', status: 'active',
      lease_start_date: '2026-10-01', lease_end_date: '2027-02-01',
      created_at: '2026-10-01T00:00:00Z',
    }] : []];
    if (sql.includes('FROM properties')) return [params[0] === 'prop-002' ? [{
      id: 'prop-002', title: 'Test Accommodation', wifi_rating: 4.5, wifi_speed_mbps: 50,
      has_dedicated_desk: 1, has_backup_generator: 1, quiet_hours_start: '22:00',
      quiet_hours_end: '06:00', quiet_hours_policy_enforced: 1, max_study_guests: 4,
    }] : []];
    return [{ affectedRows: 1, insertId: 1 }];
  });
  return { app: require('../app'), key, access: require('../middleware/access') };
}
module.exports = { setupApi };
