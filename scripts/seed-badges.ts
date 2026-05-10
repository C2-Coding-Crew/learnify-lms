import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding badges...');

  const badges = [
    {
      name: 'Quiz Master',
      description: 'Menyelesaikan kuis dengan nilai sempurna (100).',
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=quiz-master&backgroundColor=ffd700',
      criteria: 'QUIZ_MASTER',
    },
    {
      name: 'Fast Learner',
      description: 'Menyelesaikan sebuah kursus secara penuh.',
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=fast-learner&backgroundColor=00ff00',
      criteria: 'COURSE_COMPLETER',
    },
    {
      name: 'Streak Master',
      description: 'Belajar 7 hari berturut-turut.',
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=streak-master&backgroundColor=ff4500',
      criteria: 'STREAK_7_DAYS',
    },
  ];

  for (const badge of badges) {
    await (prisma as any).badge.upsert({
      where: { criteria: badge.criteria },
      update: badge,
      create: badge,
    });
  }

  console.log('Seeding badges completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
