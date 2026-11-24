const listingOptions = require('../../shared/listingOptions.json');
const profileLimits = { name:100, email:100, student_id:100, course:100, campus:50, residence_area:100, phone:50 };
function validProfile(values) {
  return Object.entries(values).every(([key,value]) => key in profileLimits && typeof value === 'string' && value.length <= profileLimits[key] && (key !== 'name' || value.trim()) && (key !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)));
}
function validImage(value) { return typeof value === 'string' && value.length <= 500 && (!value || /^https?:\/\/[^\s]+$/i.test(value) || /^\/data\/uploads\/[a-f0-9-]+\.(png|jpg|webp)$/.test(value)); }
function validListing(values) {
  const limits = {title:255,type:50,location:100,campus:50,description:10000,phone:50};
  return Object.entries(values).every(([key,value]) => {
    if (key in limits) return typeof value === 'string' && value.length <= limits[key] && (['description','phone'].includes(key) || Boolean(value.trim())) && (key !== 'type' || listingOptions.roomTypes.includes(value));
    if (['price','vacant_units','booking_fee'].includes(key)) return Number.isSafeInteger(value) && value >= 0 && value <= 2147483647;
    if (key === 'image') return validImage(value);
    if (key === 'gender_policy') return listingOptions.genderPolicies.includes(value);
    if (key === 'furnishing_status') return listingOptions.furnishingStatuses.includes(value);
    if (key === 'amenities') return Array.isArray(value) && value.every(name => listingOptions.amenities.includes(name));
    return key === 'verified' && typeof value === 'boolean';
  });
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value.slice(0,10);
}
module.exports = { validProfile, validListing, validDate };
