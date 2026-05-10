import { db } from "../lib/db";

async function main() {
  const result = await db.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'Enrollment'");
  console.log(result);
}

main().catch(console.error).finally(() => db.$disconnect());
