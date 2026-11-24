// Call with the same connection as the mutation so the trail commits atomically.
module.exports = async function audit(connection, actor, action, target) {
  await connection.query('INSERT INTO audit_logs (actor_id,action,target_id) VALUES (?,?,?)', [actor || null, action, String(target)]);
};
