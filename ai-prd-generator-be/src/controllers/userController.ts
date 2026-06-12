import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { UserService } from '../services/userService';
import crypto from 'crypto';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  upgradeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { tier } = req.body;
      const result = await this.userService.upgradeUserSubscription(req.user.id, tier);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  handlePaymentNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = req.body;
      const rawServerKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SANDBOX_SERVER_KEY';
      const serverKey = rawServerKey.replace(/^['"]|['"]$/g, '').trim();

      // 1. Verify Midtrans Signature key
      const payload = order_id + status_code + gross_amount + serverKey;
      const hash = crypto.createHash('sha512').update(payload).digest('hex');

      if (hash !== signature_key) {
        console.error('Invalid signature key for Midtrans notification!');
        return res.status(403).json({ error: 'Invalid signature key.' });
      }

      console.log(`Midtrans notification verified for order: ${order_id}, status: ${transaction_status}`);

      // 2. If payment is successful
      const isSuccess =
        transaction_status === 'settlement' ||
        (transaction_status === 'capture' && fraud_status === 'accept');

      if (isSuccess) {
        let userId = '';
        if (order_id.startsWith('TRX_')) {
          userId = order_id.substring(4, order_id.lastIndexOf('_'));
        } else if (order_id.startsWith('ORD-PREMIUM-')) {
          const parts = order_id.split('-');
          if (parts.length >= 3) {
            userId = parts[2];
          }
        }

        if (userId) {
          await this.userService.upgradeUserToPremiumDirectly(userId);
          console.log(`User ${userId} successfully upgraded to premium via verified payment notification.`);
        } else {
          console.error(`Could not parse userId from order_id: ${order_id}`);
        }
      }

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  submitFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { rating, comment } = req.body;
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating harus berupa angka antara 1 sampai 5.' });
      }
      if (typeof comment !== 'string') {
        return res.status(400).json({ error: 'Komentar harus berupa teks.' });
      }

      await this.userService.submitFeedback(req.user.id, rating, comment);
      res.json({ success: true, message: 'Masukan berhasil dikirim. Terima kasih!' });
    } catch (err) {
      next(err);
    }
  };
}
