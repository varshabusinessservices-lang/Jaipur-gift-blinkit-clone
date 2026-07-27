import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { CartSource } from './cart.types';
import { CartRepository } from './cart.repository';

export class CartController {
  private cartService = new CartService();

  /**
   * GET /api/v1/cart
   * Get or create active cart for customer or guest
   */
  getOrCreateCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).customer?.id;
      const anonymousSessionId = req.query.anonymousSessionId as string || req.body.anonymousSessionId;
      const storeId = req.query.storeId as string || req.body.storeId;
      const source = (req.query.source as CartSource) || (req.body.source as CartSource) || CartSource.WEBSITE;

      const cart = await this.cartService.getOrCreateCart({
        customerId,
        anonymousSessionId,
        storeId,
        source,
      });

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to retrieve or create cart',
      });
    }
  };

  /**
   * GET /api/v1/cart/:publicToken
   * Retrieve cart by its public secure token
   */
  getCartByToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicToken } = req.params;
      const cart = await this.cartService.getCartByToken(publicToken);

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found or has expired',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to retrieve cart',
      });
    }
  };

  /**
   * POST /api/v1/cart/items
   * Add an item to the cart
   */
  addItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).customer?.id;
      let cartId = req.body.cartId;
      const { publicToken, simulateInventoryFailure, ...itemInput } = req.body;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        // Fallback: load or create a cart for this customer/anonymous session
        const cart = await this.cartService.getOrCreateCart({
          customerId,
          anonymousSessionId: req.body.anonymousSessionId,
          storeId: req.body.storeId,
        });
        cartId = cart.id;
      }

      const updatedCart = await this.cartService.addItemToCart(cartId, {
        ...itemInput,
        simulateInventoryFailure: simulateInventoryFailure === true,
      });

      res.status(200).json({
        success: true,
        message: 'Item added to cart successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to add item to cart',
      });
    }
  };

  /**
   * PATCH /api/v1/cart/items/:itemId
   * Update quantity of a cart item
   */
  updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itemId } = req.params;
      const { quantity, publicToken } = req.body;
      let cartId = req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.updateItemQuantity(cartId, itemId, quantity);

      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update item quantity',
      });
    }
  };

  /**
   * DELETE /api/v1/cart/items/:itemId
   * Remove item from cart
   */
  removeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { itemId } = req.params;
      const publicToken = req.query.publicToken as string || req.body.publicToken;
      let cartId = req.query.cartId as string || req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.removeItem(cartId, itemId);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to remove item from cart',
      });
    }
  };

  /**
   * POST /api/v1/cart/clear
   * Clear all items in cart
   */
  clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const publicToken = req.body.publicToken;
      let cartId = req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.clearCart(cartId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to clear cart',
      });
    }
  };

  /**
   * POST /api/v1/cart/coupon
   * Apply coupon code
   */
  applyCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { couponCode, publicToken } = req.body;
      let cartId = req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.applyCoupon(cartId, couponCode);

      res.status(200).json({
        success: true,
        message: 'Coupon code applied successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to apply coupon',
      });
    }
  };

  /**
   * DELETE /api/v1/cart/coupon
   * Remove active coupon code
   */
  removeCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
      const publicToken = req.query.publicToken as string || req.body.publicToken;
      let cartId = req.query.cartId as string || req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.removeCoupon(cartId);

      res.status(200).json({
        success: true,
        message: 'Coupon code removed successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to remove coupon',
      });
    }
  };

  /**
   * POST /api/v1/cart/referral
   * Apply referral code
   */
  applyReferral = async (req: Request, res: Response): Promise<void> => {
    try {
      const { referralCode, publicToken } = req.body;
      let cartId = req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.applyReferral(cartId, referralCode);

      res.status(200).json({
        success: true,
        message: 'Referral code applied successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to apply referral code',
      });
    }
  };

  /**
   * POST /api/v1/cart/delivery-address
   * Set delivery address id for estimation
   */
  updateDeliveryAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { addressId, publicToken } = req.body;
      let cartId = req.body.cartId;

      if (!cartId && publicToken) {
        const cart = await this.cartService.getCartByToken(publicToken);
        if (cart) cartId = cart.id;
      }

      if (!cartId) {
        res.status(400).json({ success: false, message: 'cartId or publicToken is required' });
        return;
      }

      const updatedCart = await this.cartService.updateDeliveryAddress(cartId, addressId);

      res.status(200).json({
        success: true,
        message: 'Delivery address updated successfully',
        data: updatedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to set delivery address',
      });
    }
  };

  /**
   * POST /api/v1/cart/merge
   * Merge guest anonymous cart to authenticated customer cart
   */
  mergeCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).customer?.id;
      const { guestCartToken } = req.body;

      if (!customerId) {
        res.status(401).json({ success: false, message: 'Unauthorized customer access' });
        return;
      }

      if (!guestCartToken) {
        res.status(400).json({ success: false, message: 'guestCartToken is required' });
        return;
      }

      const mergedCart = await this.cartService.mergeCarts(guestCartToken, customerId);

      res.status(200).json({
        success: true,
        message: 'Guest cart merged successfully',
        data: mergedCart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to merge carts',
      });
    }
  };

  // ==========================================
  // ADMIN CONTROL ENDPOINTS
  // ==========================================

  /**
   * GET /api/v1/admin/carts
   * List all carts for admin inspection
   */
  listCarts = async (req: Request, res: Response): Promise<void> => {
    try {
      const repo = new CartRepository();
      const status = req.query.status as string;
      const source = req.query.source as string;
      const customerId = req.query.customerId as string;

      const carts = await repo.listCarts({ status, source, customerId });

      res.status(200).json({
        success: true,
        total: carts.length,
        data: carts,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to list carts',
      });
    }
  };

  /**
   * GET /api/v1/admin/carts/:id
   * Inspect precise configuration of a specific cart
   */
  inspectCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const repo = new CartRepository();
      const cart = await repo.findCartById(id);

      if (!cart) {
        res.status(404).json({ success: false, message: 'Cart not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to inspect cart',
      });
    }
  };

  /**
   * POST /api/v1/admin/carts/cleanup
   * Manually trigger background cleanup run
   */
  triggerCleanup = async (req: Request, res: Response): Promise<void> => {
    try {
      const dryRun = req.body.dryRun === true;
      const result = await this.cartService.runCartCleanup(dryRun);

      res.status(200).json({
        success: true,
        message: `Cart cleanup ran successfully (${dryRun ? 'DRY RUN' : 'LIVE'})`,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to run cart cleanup',
      });
    }
  };
}
