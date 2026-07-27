import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CartStatus, CartSource, CartItemInventoryStatus, PersonalisationResponseStatus } from './cart.types';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { CustomerUploadsRepository } from '../customerUploads/customerUploads.repository';

import { describe, it, expect } from "vitest";

describe("Cart Engine Foundation Integration Tests", () => {
  it("should run all tests successfully", async () => {
  console.log('==================================================');
  console.log('STARTING CART ENGINE FOUNDATION INTEGRATION TESTS');
  console.log('==================================================\n');

  // Pristine reset of storage files for deterministic testing
  const filesToReset = [
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'carts.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_items.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_item_addons.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_personalisation_responses.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_discount_allocations.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_cleanup_runs.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'uploadSessions.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'customerUploads.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'fileAssets.json'),
    path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'cleanupRuns.json'),
  ];
  for (const f of filesToReset) {
    try {
      fs.writeFileSync(f, JSON.stringify([], null, 2), 'utf-8');
    } catch (e) {}
  }

  const cartService = new CartService();
  const cartRepo = new CartRepository();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] - ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] - ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // --------------------------------------------------
    // TEST 1: Guest Cart Creation & Token Generation
    // --------------------------------------------------
    console.log('--- Test Scenario 1: Guest Cart Creation ---');
    const guestCart = await cartService.getOrCreateCart({
      anonymousSessionId: 'anon-session-123',
      source: CartSource.WEBSITE,
    });

    assert(!!guestCart.id, 'Guest cart should have a unique database ID');
    assert(guestCart.status === CartStatus.ACTIVE, 'New guest cart must be ACTIVE');
    assert(guestCart.source === CartSource.WEBSITE, 'New guest cart should preserve source');
    assert(guestCart.publicToken.startsWith('cart_'), 'Should generate a secure unguessable public cart token');
    assert(!!guestCart.expiresAt, 'Guest cart must have an expiresAt timestamp');

    // --------------------------------------------------
    // TEST 2: Retrieve Cart by Public Token
    // --------------------------------------------------
    console.log('\n--- Test Scenario 2: Retrieve Cart by Token ---');
    const retrievedCart = await cartService.getCartByToken(guestCart.publicToken);
    assert(!!retrievedCart, 'Should be able to retrieve guest cart using its public token');
    assert(retrievedCart.id === guestCart.id, 'Retrieved cart ID must match the created guest cart');

    // --------------------------------------------------
    // TEST 3: Add Standard Product & Base Calculations
    // --------------------------------------------------
    console.log('\n--- Test Scenario 3: Add Standard Product & Base Calculations ---');
    // Using a standard mock product ID from product repository list
    const cartWithItem = await cartService.addItemToCart(guestCart.id, {
      productId: 'prod-001',
      quantity: 2,
    });

    assert(cartWithItem.items.length === 1, 'Cart must contain exactly 1 item line');
    const item1 = cartWithItem.items[0];
    assert(item1.quantity === 2, 'First item quantity must be 2');
    assert(Number(item1.baseUnitPriceSnapshot) === 999, 'Mock item price snapshot must be accurate');
    assert(Number(cartWithItem.quantityTotalCached) === 2, 'Total quantity cache must be 2');
    assert(Number(cartWithItem.merchandiseSubtotalCached) === 1998, 'Merchandise subtotal must be 2 * 999 = 1998');

    // --------------------------------------------------
    // TEST 4: Add Same Configuration & combining Quantities (Uniqueness)
    // --------------------------------------------------
    console.log('\n--- Test Scenario 4: Combining Quantities (Uniqueness) ---');
    const cartMergedItem = await cartService.addItemToCart(guestCart.id, {
      productId: 'prod-001',
      quantity: 3,
    });

    assert(cartMergedItem.items.length === 1, 'Cart item lines must remain unique (no duplicate config rows)');
    assert(cartMergedItem.items[0].quantity === 5, 'Quantities must combine (2 + 3 = 5)');
    assert(Number(cartMergedItem.quantityTotalCached) === 5, 'Total quantity cache must be 5');

    // --------------------------------------------------
    // TEST 5: Variation Price Surcharges & Snapshotting
    // --------------------------------------------------
    console.log('\n--- Test Scenario 5: Variation Surcharges & Snapshotting ---');
    const cartWithVariation = await cartService.addItemToCart(guestCart.id, {
      productId: 'prod-001',
      variationId: 'var-001-large',
      quantity: 1,
    });

    assert(cartWithVariation.items.length === 2, 'Should add variation as a distinct config line');
    const varItem = cartWithVariation.items.find((i: any) => i.variationId === 'var-001-large');
    assert(!!varItem, 'Variation line item must exist');
    assert(Number(varItem.variationPriceAdjustmentSnapshot) === 300, 'Price adjustment must be loaded');
    assert(Number(varItem.finalUnitProductPriceSnapshot) === 1299, 'Final unit price must be base + adjustment (999 + 300 = 1299)');

    // --------------------------------------------------
    // TEST 6: Selected Add-on Snapshot Pricing
    // --------------------------------------------------
    console.log('\n--- Test Scenario 6: Selected Add-ons Snapshot Pricing ---');
    const cartWithAddons = await cartService.addItemToCart(guestCart.id, {
      productId: 'prod-002',
      quantity: 1,
      selectedAddOns: [
        {
          productAddOnId: 'addon-wrap-01',
          quantity: 1,
          customerInput: 'Happy Anniversary!',
        }
      ]
    });

    const addOnItem = cartWithAddons.items.find((i: any) => i.productId === 'prod-002');
    assert(!!addOnItem, 'Addon product item row must exist');
    assert(addOnItem.addOns.length === 1, 'Should link selected addon record to CartItem');
    const linkedAddon = addOnItem.addOns[0];
    assert(Number(linkedAddon.unitPriceSnapshot) === 30, 'Addon unit price snapshot must equal 30.00');
    assert(Number(cartWithAddons.addOnTotalCached) === 30, 'Addon total cached on cart must be 30.00');

    // --------------------------------------------------
    // TEST 7: Personalisation Schema Form Validations
    // --------------------------------------------------
    console.log('\n--- Test Scenario 7: Personalisation Validations ---');
    const cartWithPersonalisation = await cartService.addItemToCart(guestCart.id, {
      productId: 'prod-001',
      personalisationFormId: 'form-baby-frame',
      personalisationResponse: {
        'field-baby-name': 'Aarav Sharma',
        'field-baby-dob': '2026-05-10',
        'field-baby-time': '09:45 AM',
        'field-baby-weight': '3.2 kg',
        'field-mother-name': 'Priya Sharma',
        'field-father-name': 'Amit Sharma',
        'field-baby-main-photo': [{ "fileAssetId": "asset-1", "size": 1024 }],
        'field-baby-supporting-photos': [
          { "fileAssetId": "asset-s1", "size": 1024 },
          { "fileAssetId": "asset-s2", "size": 1024 },
          { "fileAssetId": "asset-s3", "size": 1024 },
          { "fileAssetId": "asset-s4", "size": 1024 },
          { "fileAssetId": "asset-s5", "size": 1024 }
        ],
        'field-baby-whatsapp': '9876543210'
      },
      quantity: 1,
    });

    const persItem = cartWithPersonalisation.items.find((i: any) => i.personalisationResponseId !== null);
    assert(!!persItem, 'Personalised cart item row must exist');
    assert(persItem.requiresPersonalisation === true, 'Product should be marked as requiring personalisation');
    if (!persItem.personalisationComplete) {
      console.error('Validation errors:', persItem.personalisationResponse?.validationResultJson);
    }
    assert(persItem.personalisationComplete === true, 'Response must be valid and complete');
    assert(persItem.personalisationResponse.responseStatus === PersonalisationResponseStatus.COMPLETE, 'Status must be COMPLETE');

    // --------------------------------------------------
    // TEST 8: Coupon Code Deductions (FIRST100)
    // --------------------------------------------------
    console.log('\n--- Test Scenario 8: Coupon Deductions (FIRST100) ---');
    const cartWithCoupon = await cartService.applyCoupon(guestCart.id, 'FIRST100');
    assert(cartWithCoupon.couponCode === 'FIRST100', 'Coupon code must be applied');
    assert(Number(cartWithCoupon.discountTotalCached) === 100, 'Discount total must deduct 100 INR');

    // --------------------------------------------------
    // TEST 9: Referral Code (No Deductions)
    // --------------------------------------------------
    console.log('\n--- Test Scenario 9: Referral (No Deductions) ---');
    const cartWithReferral = await cartService.applyReferral(guestCart.id, 'JAIPUR-FRIEND');
    assert(cartWithReferral.referralCode === 'JAIPUR-FRIEND', 'Referral code must be applied for tracking');
    assert(Number(cartWithReferral.discountTotalCached) === 100, 'Referral signup codes must not act as Cart discount codes (should remain exactly 100 from coupon)');

    // --------------------------------------------------
    // TEST 10: Logged-in Customer Cart & Wallet Preview Caps
    // --------------------------------------------------
    console.log('\n--- Test Scenario 10: Customer Cart & Wallet Preview Caps ---');
    const customerCart = await cartService.getOrCreateCart({
      customerId: 'cust-mock-001',
      source: CartSource.ANDROID_APP,
    });

    assert(customerCart.customerId === 'cust-mock-001', 'Cart must be linked to authenticated customer');
    assert(customerCart.expiresAt.getTime() > Date.now(), 'ExpiresAt timestamp must be set');

    // Add item to customer cart
    await cartService.addItemToCart(customerCart.id, {
      productId: 'prod-001',
      quantity: 1,
    });

    const updatedCustCart = await cartService.recalculateCartTotals(customerCart.id);
    const subtotal = Number(updatedCustCart.merchandiseSubtotalCached);
    const walletUsed = Number(updatedCustCart.walletPreviewAmountCached);

    // Wallet cap is 15% of subtotal
    const expectedCap = subtotal * 0.15;
    assert(walletUsed <= expectedCap, 'Wallet usage must be capped at exactly 15% of subtotal');

    // --------------------------------------------------
    // TEST 11: Guest Cart Merging Upon Login
    // --------------------------------------------------
    console.log('\n--- Test Scenario 11: Guest Cart Merging Upon Login ---');
    // Create new guest cart
    const tempGuestCart = await cartService.getOrCreateCart({
      anonymousSessionId: 'temp-session',
    });
    // Add item to it
    await cartService.addItemToCart(tempGuestCart.id, {
      productId: 'prod-002',
      quantity: 2,
    });

    // Merge guest cart into customer cart
    const mergedCart = await cartService.mergeCarts(tempGuestCart.publicToken, 'cust-mock-001');

    assert(mergedCart.items.some((i: any) => i.productId === 'prod-002'), 'Merged cart must contain products from the guest cart');
    const expiredGuestCart = await cartRepo.findCartById(tempGuestCart.id, true);
    assert(expiredGuestCart.status === CartStatus.CONVERTED, 'Merged guest cart must be marked as CONVERTED');

    // --------------------------------------------------
    // TEST 12: Cart Cleanup & Auto-Expiry Run
    // --------------------------------------------------
    console.log('\n--- Test Scenario 12: Expired Cart Cleanup Run ---');
    const cleanupResult = await cartService.runCartCleanup(false);
    assert(cleanupResult.scannedCount >= 2, 'Should scan all active carts');
    assert(typeof cleanupResult.expiredCount === 'number', 'Should return an expired count');

    // --------------------------------------------------
    // TEST 13: Personalised vs Non-Personalised Item Merging
    // --------------------------------------------------
    console.log('\n--- Test Scenario 13: Personalised vs Non-Personalised Item Merging Behavior ---');
    const mergeCart = await cartService.getOrCreateCart({
      anonymousSessionId: 'merge-session-abc',
    });

    // Add first personalised item
    await cartService.addItemToCart(mergeCart.id, {
      productId: 'prod-001',
      personalisationFormId: 'form-baby-frame',
      personalisationResponse: { name: 'Aarav' },
      quantity: 1,
    });

    // Add second personalised item with different response - should remain separate
    await cartService.addItemToCart(mergeCart.id, {
      productId: 'prod-001',
      personalisationFormId: 'form-baby-frame',
      personalisationResponse: { name: 'Vivaan' },
      quantity: 1,
    });

    const cartSeparated = await cartService.getCartByToken(mergeCart.publicToken);
    assert(cartSeparated.items.length === 2, 'Personalised items with different responses must remain separate');

    // Add third personalised item with identical response - should merge with first
    await cartService.addItemToCart(mergeCart.id, {
      productId: 'prod-001',
      personalisationFormId: 'form-baby-frame',
      personalisationResponse: { name: 'Aarav' },
      quantity: 1,
    });

    const cartMergedSome = await cartService.getCartByToken(mergeCart.publicToken);
    assert(cartMergedSome.items.length === 2, 'Personalised items with identical responses must merge');
    const itemAarav = cartMergedSome.items.find((i: any) => i.personalisationResponse && JSON.parse(i.personalisationResponse.responseJson).name === 'Aarav');
    assert(itemAarav.quantity === 2, 'Identical personalised item quantity should be 2');

    // --------------------------------------------------
    // TEST 14: Upload Session Retention Holds
    // --------------------------------------------------
    console.log('\n--- Test Scenario 14: Upload Session Retention Holds ---');
    const uploadRepo = new CustomerUploadsRepository();

    // Create mock upload session and upload
    const mockSession = await uploadRepo.createSession({
      publicToken: 'token-abc-123',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const mockUpload = await uploadRepo.createUpload({
      uploadSessionId: mockSession.id,
      fileAssetId: 'asset-xyz',
      originalFileName: 'photo.jpg',
      safeFileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      extension: 'jpg',
      sizeBytes: 1024,
      lifecycleStatus: 'TEMPORARY',
    });

    // Verify it starts as TEMPORARY
    let uploadState = await uploadRepo.findUploadById(mockUpload.id);
    assert(uploadState.lifecycleStatus === 'TEMPORARY', 'Upload must start as TEMPORARY');

    // Link it to cart - should apply CART_ACTIVE hold
    const holdCart = await cartService.getOrCreateCart({
      anonymousSessionId: 'hold-session',
    });

    await cartService.addItemToCart(holdCart.id, {
      productId: 'prod-001',
      quantity: 1,
      uploadSessionToken: 'token-abc-123',
    });

    uploadState = await uploadRepo.findUploadById(mockUpload.id);
    assert(uploadState.lifecycleStatus === 'CART_ACTIVE', 'Upload lifecycleStatus must be updated to CART_ACTIVE when linked to active cart');

    // Remove item from cart - should release hold back to TEMPORARY
    const cartWithHoldingItem = await cartService.getCartByToken(holdCart.publicToken);
    const holdingItemId = cartWithHoldingItem.items[0].id;
    await cartService.removeItem(holdCart.id, holdingItemId);

    uploadState = await uploadRepo.findUploadById(mockUpload.id);
    assert(uploadState.lifecycleStatus === 'TEMPORARY', 'Upload must revert to TEMPORARY after cart item is removed');

    console.log('\n==================================================');
    console.log(`CART ENGINE FOUNDATION INTEGRATION TESTS COMPLETE!`);
    console.log(`PASSED: ${passedTests} / ${totalTests} ASSERTIONS`);
    console.log('==================================================');

    } catch (error: any) { throw error; } }); });