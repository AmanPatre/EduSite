const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Database Values...");

    const skills = ['React', 'Next.js', 'Python', 'Docker'];

    for (const skill of skills) {
        const data = await prisma.trendScore.findUnique({
            where: { skillName: skill }
        });

        if (data) {
            console.log(`\n📌 ${skill}:`);
            console.log(`   - Trend Score: ${data.trendScore}`);
            console.log(`   - GitHub Score: ${data.githubScore} (Weight: ${data.githubWeight})`);
            console.log(`   - YouTube Score: ${data.youtubeScore} (Weight: ${data.youtubeWeight})`);
            console.log(`   - Updated At: ${data.updatedAt}`);
        } else {
            console.log(`\n❌ ${skill}: Not found in DB.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
