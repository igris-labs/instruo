export function calculateLoan(principal: number, rate: number, months: number) {
  if (
    ![principal, rate, months].every(Number.isFinite) ||
    principal < 0 ||
    principal > 1e12 ||
    rate < 0 ||
    rate > 100 ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > 1200
  )
    throw new Error(
      "Use an amount from 0–1 trillion, a 0–100% rate and a whole term from 1–1,200 months.",
    );
  const r = rate / 1200;
  const monthly = r ? (principal * r) / -Math.expm1(-months * Math.log1p(r)) : principal / months;
  let balance = principal;
  const schedule = Array.from({ length: months }, (_, index) => {
    const interest = balance * r;
    const payment = Math.min(balance + interest, monthly);
    const repaid = payment - interest;
    balance = Math.max(0, balance - repaid);
    return { month: index + 1, payment, interest, principal: repaid, balance };
  });
  return { monthly, total: monthly * months, interest: monthly * months - principal, schedule };
}
