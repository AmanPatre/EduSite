const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("🔌 Testing Database Connection...");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ ERROR: DATABASE_URL is missing from .env");
        return;
    }

    // Extract host for logging (privacy safe)
    const host = dbUrl.split('@')[1] ? dbUrl.split('@')[1].split('/')[0] : 'UNKNOWN_HOST';
    console.log(`Target Host: ${host}`);

    try {
        console.log("Attempting to connect via Prisma...");
        await prisma.$connect();
        console.log("✅ Connection established!");

        const count = await prisma.user.count();
        console.log(`✅ Database query successful! Found ${count} users.`);
    } catch (error) {
        console.error("❌ FAILED to connect.");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.code) console.error("Error Code:", error.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
