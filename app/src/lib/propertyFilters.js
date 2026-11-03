const normalize = value => typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s_-]+/g, '') : '';
const roomAliases = { hostelroom: 'hostel', sharedapartment: 'shared', single: 'singleroom', onebedroom: '1bedroom', twobedroom: '2bedroom' };
export function matchesPropertyOptions(property, filters) {
  const room = value => roomAliases[normalize(value)] || normalize(value);
  return (!filters.type || filters.type === 'all' || room(property.type) === room(filters.type)) &&
    (!filters.gender_policy || filters.gender_policy === 'all' || (normalize(property.gender_policy) !== '' && normalize(property.gender_policy) === normalize(filters.gender_policy))) &&
    (!filters.furnishing_status || filters.furnishing_status === 'all' || (normalize(property.furnishing_status) !== '' && normalize(property.furnishing_status) === normalize(filters.furnishing_status)));
}
