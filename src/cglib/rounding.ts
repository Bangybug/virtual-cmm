// https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

export class Decimal {
  private static EPSILON = Number.EPSILON === undefined ? 2 ** -52 : Number.EPSILON

  // Decimal round (half away from zero)
  static round(num: number, decimalPlaces: number) {
    const p = 10 ** (decimalPlaces || 0)
    const n = num * p * (1 + Decimal.EPSILON)
    return Math.round(n) / p
  }

  // Decimal ceil
  static ceil(num: number, decimalPlaces: number) {
    const p = 10 ** (decimalPlaces || 0)
    const n = num * p * (1 - Math.sign(num) * Decimal.EPSILON)
    return Math.ceil(n) / p
  }

  // Decimal floor
  static floor(num: number, decimalPlaces: number) {
    const p = 10 ** (decimalPlaces || 0)
    const n = num * p * (1 + Math.sign(num) * Number.EPSILON)
    return Math.floor(n) / p
  }

  // Decimal trunc
  static trunc(num: number, decimalPlaces: number) {
    return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces)
  }

  // Format using fixed-point notation
  static toFixed(num: number, decimalPlaces: number) {
    return this.round(num, decimalPlaces).toFixed(decimalPlaces)
  }
}
