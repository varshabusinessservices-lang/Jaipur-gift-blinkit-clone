export class MoneyUtil {
  static add(a: number, b: number): number {
    return Math.round((a + b) * 100) / 100;
  }

  static subtract(a: number, b: number): number {
    return Math.round((a - b) * 100) / 100;
  }

  static multiply(a: number, b: number): number {
    return Math.round((a * b) * 100) / 100;
  }

  static divide(a: number, b: number): number {
    if (b === 0) return 0;
    return Math.round((a / b) * 100) / 100;
  }

  static percentageOf(amount: number, percentage: number): number {
    return Math.round((amount * (percentage / 100)) * 100) / 100;
  }

  static multiplyMoney(amount: number, factor: number): number {
    return Math.round((amount * factor) * 100) / 100;
  }

  static divideMoney(amount: number, divisor: number): number {
    if (divisor === 0) return 0;
    return Math.round((amount / divisor) * 100) / 100;
  }
}
