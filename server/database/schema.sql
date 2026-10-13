CREATE DATABASE IF NOT EXISTS settlein_db;
USE settlein_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  student_id VARCHAR(100) NULL,
  course VARCHAR(255) DEFAULT '',
  campus VARCHAR(100) DEFAULT '',
  residence_area VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  university_affiliation VARCHAR(255) NULL,
  campus_branch VARCHAR(255) NULL,
  year_of_study INT NULL,
  is_verified_student TINYINT(1) DEFAULT 0,
  avatar_url TEXT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  distance VARCHAR(255) DEFAULT 'Near Campus',
  verified TINYINT(1) DEFAULT 1,
  image TEXT NULL,
  description TEXT NULL,
  landlord VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  whatsapp VARCHAR(50) NULL,
  vacant_units INT DEFAULT 1,
  amenities TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  security_deposit INT NULL,
  booking_fee INT NULL,
  water_included TINYINT(1) NULL,
  wifi_included TINYINT(1) NULL,
  garbage_included TINYINT(1) NULL,
  gender_policy VARCHAR(100) NULL,
  furnishing_status VARCHAR(100) NULL,
  wifi_rating DECIMAL(2,1) NULL,
  wifi_speed_mbps INT NULL,
  has_dedicated_desk TINYINT(1) NULL,
  has_backup_generator TINYINT(1) NULL,
  quiet_hours_start VARCHAR(5) NULL,
  quiet_hours_end VARCHAR(5) NULL,
  quiet_hours_policy_enforced TINYINT(1) NULL,
  max_study_guests INT NULL,
  last_inspected_at TIMESTAMP NULL,
  group_inquiries TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_inquiries (
  inquiry_id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  initiator_student_id INT NOT NULL,
  member_student_ids TEXT NOT NULL,
  target_campus VARCHAR(100) NOT NULL,
  preferred_room_type VARCHAR(50) NOT NULL,
  max_budget_per_person_kes INT NOT NULL,
  move_in_target_date DATE NOT NULL,
  notes VARCHAR(500) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  student_id VARCHAR(100) DEFAULT '',
  property_id VARCHAR(100) NOT NULL,
  property_title VARCHAR(255) DEFAULT '',
  status VARCHAR(50) DEFAULT 'active',
  move_in_date VARCHAR(100),
  expected_arrival_time VARCHAR(50),
  lease_start_date VARCHAR(50),
  lease_end_date VARCHAR(50),
  relocation_window_start VARCHAR(100),
  relocation_window_end VARCHAR(100),
  lease_duration VARCHAR(50) DEFAULT '1 Semester (4 months)',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users
  (id, name, email, course, campus, residence_area, phone, role)
VALUES
  (13, 'Tripolos', 'trip45@gmail.com',
   'Bachelor of Business Information Technology (BBIT)', 'strathmore',
   'Madaraka Estate', '0712648910', 'student')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO properties
  (id, title, type, price, location, campus, distance, verified, image,
   description, landlord, phone, whatsapp, vacant_units, amenities,
   wifi_rating, wifi_speed_mbps, has_dedicated_desk, has_backup_generator,
   quiet_hours_start, quiet_hours_end, quiet_hours_policy_enforced,
   max_study_guests, last_inspected_at)
VALUES
  ('prop-003', 'Ngando Legacy Hall', 'Shared Apartment', 18000,
   'Ngando, Nairobi', 'ku', '0.8km · Kenyatta University', 1,
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
   'Premium shared apartments with city views.', 'Legacy Real Estate',
   '+254 712 000 103', '+254 712 000 103', 1,
   'Wi-Fi, Hot Shower, Balcony, CCTV, Gym', 4.5, 50, 1, 1,
   '22:00', '06:00', 1, 4, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE id = id;
