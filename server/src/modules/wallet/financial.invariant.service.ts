import { Prisma } from '@prisma/client';

export class FinancialInvariantService {
  static validateCreditLot(
    initial: number | Prisma.Decimal,
    remaining: number | Prisma.Decimal,
    reserved: number | Prisma.Decimal,
    consumed: number | Prisma.Decimal,
    expired: number | Prisma.Decimal,
    reversed: number | Prisma.Decimal
  ): boolean {
    const initVal = new Prisma.Decimal(initial.toString());
    const remVal = new Prisma.Decimal(remaining.toString());
    const resVal = new Prisma.Decimal(reserved.toString());
    const conVal = new Prisma.Decimal(consumed.toString());
    const expVal = new Prisma.Decimal(expired.toString());
    const revVal = new Prisma.Decimal(reversed.toString());

    const totalAccounted = remVal.plus(resVal).plus(conVal).plus(expVal).plus(revVal);
    const diff = totalAccounted.minus(initVal).abs();

    if (diff.greaterThan(new Prisma.Decimal('0.01'))) {
      throw new Error(
        `Financial Invariant Violation: Credit lot sum (${totalAccounted.toString()}) does not match initial amount (${initVal.toString()})`
      );
    }
    return true;
  }

  static validateReservationAllocations(
    requestedAmount: number | Prisma.Decimal,
    allocations: { amount: number | Prisma.Decimal }[]
  ): boolean {
    const reqVal = new Prisma.Decimal(requestedAmount.toString());
    const sumAllocated = allocations.reduce(
      (acc, curr) => acc.plus(new Prisma.Decimal(curr.amount.toString())),
      new Prisma.Decimal('0')
    );
    const diff = sumAllocated.minus(reqVal).abs();

    if (diff.greaterThan(new Prisma.Decimal('0.01'))) {
      throw new Error(
        `Financial Invariant Violation: Reservation allocations sum (${sumAllocated.toString()}) does not match requested amount (${reqVal.toString()})`
      );
    }
    return true;
  }

  static validateLedgerBalance(
    opening: number | Prisma.Decimal,
    direction: 'CREDIT' | 'DEBIT',
    amount: number | Prisma.Decimal,
    closing: number | Prisma.Decimal
  ): boolean {
    const openVal = new Prisma.Decimal(opening.toString());
    const amtVal = new Prisma.Decimal(amount.toString());
    const closeVal = new Prisma.Decimal(closing.toString());

    const expected = direction === 'CREDIT' ? openVal.plus(amtVal) : openVal.minus(amtVal);
    const diff = expected.minus(closeVal).abs();

    if (diff.greaterThan(new Prisma.Decimal('0.01'))) {
      throw new Error(
        `Financial Invariant Violation: Ledger balance transition (${openVal} ${direction} ${amtVal}) expected ${expected.toString()} but got ${closeVal.toString()}`
      );
    }
    return true;
  }
}

