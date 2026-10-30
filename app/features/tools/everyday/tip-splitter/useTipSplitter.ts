import { computed, ref } from "vue";

export function splitBill(bill: number, tipPercent: number, people: number, digits = 2) {
  if (
    ![bill, tipPercent, people].every(Number.isFinite) ||
    bill < 0 ||
    tipPercent < 0 ||
    people < 1 ||
    !Number.isInteger(people)
  )
    return null;
  const scale = 10 ** digits;
  const base = Math.round(bill * scale);
  const tip = Math.round((base * tipPercent) / 100);
  const total = base + tip;
  if (![base, tip, total].every(Number.isSafeInteger)) return null;
  const share = Math.floor(total / people);
  const extraPeople = total % people;
  return {
    bill: base / scale,
    tip: tip / scale,
    total: total / scale,
    share: share / scale,
    extraShare: (share + 1) / scale,
    extraPeople,
  };
}
export function useTipSplitter() {
  const bill = ref<number | null>(80);
  const tipPercent = ref<number | null>(18);
  const people = ref<number | null>(2);
  const currency = ref("USD");
  const result = computed(() =>
    bill.value === null || tipPercent.value === null || people.value === null
      ? null
      : splitBill(bill.value, tipPercent.value, people.value, currency.value === "JPY" ? 0 : 2),
  );
  const money = (value: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: currency.value }).format(value);
  const summary = computed(() =>
    result.value
      ? `Bill: ${money(result.value.bill)}\nTip (${tipPercent.value}%): ${money(result.value.tip)}\nTotal: ${money(result.value.total)}\nSplit between ${people.value}: ${money(result.value.share)} each${result.value.extraPeople ? `; ${result.value.extraPeople} pay ${money(result.value.extraShare)} instead to cover rounding.` : "."}`
      : "",
  );
  return { bill, tipPercent, people, currency, result, money, summary };
}
