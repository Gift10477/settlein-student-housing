// JSON_QUOTE + GROUP_CONCAT also supports the project's older MariaDB release.
// The controlled amenity catalogue is well within the default aggregation limit.
const selectProperties = `SELECT properties.*, (SELECT CONCAT('[',GROUP_CONCAT(JSON_QUOTE(a.name) ORDER BY a.name SEPARATOR ','),']') FROM property_amenities pa JOIN amenities a ON a.id=pa.amenity_id WHERE pa.property_id=properties.id) AS amenities FROM properties`;
async function saveAmenities(connection, propertyId, names) {
  await connection.query('DELETE FROM property_amenities WHERE property_id=?', [propertyId]);
  for (const name of new Set(names)) await connection.query('INSERT INTO property_amenities (property_id,amenity_id) SELECT ?,id FROM amenities WHERE name=?', [propertyId, name]);
}
module.exports = { selectProperties, saveAmenities };
