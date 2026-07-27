import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomersRepository } from '../modules/customers/customers.repository';

const repo = new CustomersRepository();

export const requireCustomerAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing bearer token', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.CUSTOMER_ACCESS_TOKEN_SECRET || 'customer-jwt-access-secret-key-1234';
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired access token', code: 'UNAUTHORIZED' });
    }

    const customer = await repo.findCustomerById(decoded.customerId);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Customer account not found', code: 'UNAUTHORIZED' });
    }

    if (customer.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Forbidden: Customer account is blocked', code: 'BLOCKED' });
    }

    // Attach customer to request
    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication failed', code: 'UNAUTHORIZED' });
  }
};
