import { prisma } from '../lib/prismaClient';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async upgradeToPremium(userId: string) {
    return prisma.$executeRaw`
      UPDATE "User" 
      SET "tier" = 'premium' 
      WHERE "id" = ${userId}
    `;
  }

  async upgradeToTier(userId: string, tier: string) {
    return prisma.$executeRaw`
      UPDATE "User" 
      SET "tier" = ${tier} 
      WHERE "id" = ${userId}
    `;
  }
}
