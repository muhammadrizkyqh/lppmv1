import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugNIDN() {
  const nidn = '10501104';
  const email = 'dagi.mardhan@mail.com';

  console.log('\n=== DEBUG NIDN:', nidn, '===\n');

  // Check User table
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: nidn },
        { email: email }
      ]
    }
  });

  console.log('1. User record:');
  console.log(JSON.stringify(user, null, 2));

  // Check Dosen table
  const dosen = await prisma.dosen.findUnique({
    where: { nidn: nidn }
  });

  console.log('\n2. Dosen record:');
  console.log(JSON.stringify(dosen, null, 2));

  // Check if user has dosen association
  if (user) {
    const userWithDosen = await prisma.user.findUnique({
      where: { id: user.id },
      include: { dosen: true }
    });

    console.log('\n3. User with Dosen relation:');
    console.log(JSON.stringify(userWithDosen, null, 2));
  }

  // Compare with a working NIDN
  const workingUser = await prisma.user.findFirst({
    where: { role: 'DOSEN', username: { not: nidn } },
    include: { dosen: true }
  });

  console.log('\n4. Sample working DOSEN user for comparison:');
  console.log(JSON.stringify({
    id: workingUser?.id,
    username: workingUser?.username,
    email: workingUser?.email,
    role: workingUser?.role,
    hasDosenRecord: !!workingUser?.dosen,
    dosenId: workingUser?.dosen?.id
  }, null, 2));

  await prisma.$disconnect();
}

debugNIDN().catch(console.error);
