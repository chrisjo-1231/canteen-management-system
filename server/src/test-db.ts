import prisma from "./lib/prisma.js";

async function main() {
  const users = await prisma.user.count();

  console.log("Database connected!");
  console.log("Users:", users);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });