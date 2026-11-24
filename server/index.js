const app = require('./app');
if (process.env.NODE_ENV === 'production') {
  for (const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME','CORS_ORIGINS','SECURITY_KEY']) if (!process.env[key]) throw new Error(`Missing production setting: ${key}`);
  if (!/^[a-f0-9]{64}$/i.test(process.env.SECURITY_KEY)) throw new Error('SECURITY_KEY must be 64 hexadecimal characters.');
  if (process.env.DB_SSL !== 'true') throw new Error('Hosted MySQL requires DB_SSL=true.');
}
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
