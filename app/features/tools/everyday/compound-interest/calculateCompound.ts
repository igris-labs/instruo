export function calculateCompound(
  principal: number,
  contribution: number,
  rate: number,
  years: number,
  frequency: number,
  beginning = false,
) {
  if (
    ![principal, contribution, rate, years, frequency].every(Number.isFinite) ||
    principal < 0 ||
    contribution < 0 ||
    principal > 1e12 ||
    contribution > 1e9 ||
    rate < -99 ||
    rate > 100 ||
    !Number.isInteger(years) ||
    years < 1 ||
    years > 100 ||
    ![1, 4, 12].includes(frequency)
  )
    throw new Error(
      "Check amounts, a -99–100% rate, 1–100 whole years and the compounding frequency.",
    );
  const r = rate / 100 / frequency;
  const rows = Array.from({ length: years }, (_, index) => {
    const periods = (index + 1) * frequency;
    const growth = Math.exp(periods * Math.log1p(r));
    const annuity = r === 0 ? periods : Math.expm1(periods * Math.log1p(r)) / r;
    const value = principal * growth + contribution * annuity * (beginning ? 1 + r : 1);
    if (!Number.isFinite(value) || value > Number.MAX_SAFE_INTEGER)
      throw new Error("Result exceeds safe numeric precision. Reduce the duration or amounts.");
    const contributed = principal + contribution * periods;
    return { year: index + 1, value, contributed, interest: value - contributed };
  });
  return { ...rows.at(-1)!, rows };
}
