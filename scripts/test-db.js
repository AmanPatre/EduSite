// scripts/test-db.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("🔌 Testing Database Connection...");
    console.log(`URL: ${process.env.DATABASE_URL?.split('@')[1]}`); // Log only host for privacy

    try {
        const count = await prisma.user.count();
        console.log(`✅ SUCCESS! Connected to MongoDB. Found ${count} users.`);
    } catch (error) {
        console.error("❌ FAILED to connect.");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
