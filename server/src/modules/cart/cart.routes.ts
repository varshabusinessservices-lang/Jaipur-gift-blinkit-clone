import { Router } from 'express';
import { CartController } from './cart.controller';
import { requireCustomerAuth } from '../../middlewares/customerAuth.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { CustomersRepository } from '../customers/customers.repository';

const router = Router();
const controller = new CartController();
const customersRepo = new CustomersRepository();

// Optional customer authentication middleware: if a customer token is present, we decode it
// and attach the customer, but we do NOT reject the request if the token is missing.
const optionalCustomerAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.CUSTOMER_ACCESS_TOKEN_SECRET || 'customer-jwt-access-secret-key-1234';
      const decoded: any = jwt.verify(token, secret);
      const customer = await customersRepo.findCustomerById(decoded.customerId);
      if (customer && customer.status !== 'BLOCKED') {
        req.customer = customer;
      }
    }
  } catch (err) {
    // Gracefully ignore validation failures for optional auth
  }
  next();
};

// ==========================================
// CLIENT CART ROUTES
// ==========================================

// Get or create cart (supports guest and logged-in customer)
router.get('/', optionalCustomerAuth, controller.getOrCreateCart);

// Retrieve cart by guest token
router.get('/:publicToken', controller.getCartByToken);

// Add item to cart
router.post('/items', optionalCustomerAuth, controller.addItem);

// Update item quantity
router.patch('/items/:itemId', optionalCustomerAuth, controller.updateItemQuantity);

// Remove item from cart
router.delete('/items/:itemId', optionalCustomerAuth, controller.removeItem);

// Clear cart
router.post('/clear', optionalCustomerAuth, controller.clearCart);

// Apply discount coupon
router.post('/coupon', optionalCustomerAuth, controller.applyCoupon);

// Remove discount coupon
router.delete('/coupon', optionalCustomerAuth, controller.removeCoupon);

// Apply referral code
router.post('/referral', optionalCustomerAuth, controller.applyReferral);

// Set delivery address for estimation
router.post('/delivery-address', optionalCustomerAuth, controller.updateDeliveryAddress);

// Merge guest cart into customer cart (must be logged in)
router.post('/merge', requireCustomerAuth, controller.mergeCart);


// ==========================================
// ADMIN CART ROUTES
// ==========================================

// List all carts for admin inspection
router.get('/admin/list', requireAuth, controller.listCarts);

// Inspect a precise cart's configurations
router.get('/admin/inspect/:id', requireAuth, controller.inspectCart);

// Trigger manual expired carts cleanup run
router.post('/admin/cleanup', requireAuth, controller.triggerCleanup);

export default router;
export { router as cartRoutes };
