import { Decimal } from 'decimal.js';

export const getMultiplier = (amount: number, multiplier: number) => {
  let decimalAmount = new Decimal(multiplier);

  if (amount >= 100000) {
    return decimalAmount.plus(0.1).toNumber();
  }

  return decimalAmount.toNumber();
};
