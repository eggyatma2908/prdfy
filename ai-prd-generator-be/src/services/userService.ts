import { UserRepository } from '../repositories/userRepository';
import { NotFoundError, ForbiddenError } from '../errors/errors';
import crypto from 'crypto';
import { prisma } from '../lib/prismaClient';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createMidtransTransaction(userId: string, email: string, name: string) {
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SANDBOX_SERVER_KEY';
    const serverKey = rawServerKey.replace(/^['"]|['"]$/g, '').trim();
    const rawIsProd = (process.env.MIDTRANS_IS_PRODUCTION || '').replace(/^['"]|['"]$/g, '').trim().toLowerCase();
    const isProd = rawIsProd === 'true' || (rawIsProd !== 'false' && serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));
    const snapUrl = isProd
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const orderId = `TRX_${userId}_${Date.now().toString(36)}`;
    const authHeader = Buffer.from(serverKey + ':').toString('base64');

    const response = await fetch(snapUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: 55000
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          first_name: name || 'User',
          email: email
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Midtrans API error: ${errText}`);
    }

    const data: any = await response.json();
    return { token: data.token, orderId };
  }

  async upgradeUserToPremiumDirectly(userId: string) {
    await this.userRepository.upgradeToPremium(userId);
  }

  async upgradeUserSubscription(userId: string, tier: string = 'premium') {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User tidak ditemukan.');
    }

    if (tier === 'superadministrator') {
      const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
      const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
      if (user.email !== creatorEmail) {
        throw new ForbiddenError('Upgrade ke Super Administrator hanya diperbolehkan untuk Pembuat Web (Creator).');
      }
      await this.userRepository.upgradeToTier(userId, 'superadministrator');
      return { success: true, message: 'Langganan superadministrator berhasil diaktifkan.' };
    } else {
      const transaction = await this.createMidtransTransaction(userId, user.email, user.name || 'User');

      const rawServerKey = process.env.MIDTRANS_SERVER_KEY || '';
      const rawClientKey = process.env.MIDTRANS_CLIENT_KEY || '';
      const serverKey = rawServerKey.replace(/^['"]|['"]$/g, '').trim();
      const clientKey = rawClientKey.replace(/^['"]|['"]$/g, '').trim();
      const rawIsProd = (process.env.MIDTRANS_IS_PRODUCTION || '').replace(/^['"]|['"]$/g, '').trim().toLowerCase();
      const isProduction = rawIsProd === 'true' || (rawIsProd !== 'false' && serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));

      return {
        success: true,
        token: transaction.token,
        orderId: transaction.orderId,
        isProduction,
        clientKey
      };
    }
  }

  async submitFeedback(userId: string, rating: number, comment: string) {
    return await prisma.feedback.create({
      data: {
        userId,
        rating,
        comment
      }
    });
  }
}
