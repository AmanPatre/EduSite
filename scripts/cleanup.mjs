import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.effortDemandSnapshot.deleteMany();
    console.log('Deleted all snapshots');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
