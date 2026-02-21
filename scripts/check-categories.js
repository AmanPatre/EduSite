const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkCategories() {
    console.log("🔍 Checking EffortDemandSnapshot Categories...");

    try {
        const snapshot = await prisma.effortDemandSnapshot.findFirst();

        if (!snapshot) {
            console.log("❌ No snapshot found.");
            return;
        }

        const data = snapshot.data; // This is a JSON object/array

        if (Array.isArray(data)) {
            console.log(`✅ Found ${data.length} items in snapshot.`);

            const categories = new Set();
            data.forEach(item => {
                categories.add(`'${item.category}'`); // Quote to see spaces
            });

            console.log("\nUnique Categories Found:");
            console.log([...categories].join(", "));

            console.log("\nSample Items:");
            data.slice(0, 5).forEach(item => {
                console.log(`- ${item.skillName}: [${item.category}]`);
            });

        } else {
            console.log("⚠️ Snapshot data is not an array:", typeof data);
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
