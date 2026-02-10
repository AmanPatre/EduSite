const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbUrl = process.env.DATABASE_URL || '';
const host = dbUrl.split('@')[1]?.split('/')[0] || '';

if (!host) {
    console.error("No host found in DATABASE_URL");
    process.exit(1);
}

console.log(`Attempting to resolve: ${host}`);

dns.lookup(host, (err, address, family) => {
    if (err) {
        console.error("❌ DNS Lookup Failed:", err.code, err.message);
    } else {
        console.log(`✅ Resolved: ${address} (IPv${family})`);
    }
});
