import { computed, ref } from "vue";

export function assessPassword(value: string) {
  const common = /password|qwerty|letmein|welcome|1234|abcd|admin|iloveyou/i.test(value);
  const repeated = /^(.)\1+$/.test(value) || /^(.{1,4})\1{2,}$/.test(value);
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-z\d]/i].filter((pattern) =>
    pattern.test(value),
  ).length;
  let score = !value
    ? 0
    : value.length < 8 || common || repeated
      ? 1
      : value.length < 10
        ? 2
        : value.length < 12
          ? 3
          : value.length < 16
            ? 4
            : 5;
  if (score > 3 && value.length < 20 && variety < 2) score = 3;
  if (new Set(value.toLowerCase()).size < 5 && score > 2) score = 2;
  const labels = ["Start typing", "Very guessable", "Weak", "Fair", "Good", "Strong"];
  const bars = [
    "bg-muted-foreground",
    "bg-destructive",
    "bg-destructive",
    "bg-warning",
    "bg-info",
    "bg-success",
  ];
  const text = [
    "text-muted-foreground",
    "text-destructive",
    "text-destructive",
    "text-warning",
    "text-info",
    "text-success",
  ];
  return {
    score,
    label: labels[score]!,
    bar: bars[score]!,
    text: text[score]!,
    checks: [
      { label: "At least 12 characters", passed: value.length >= 12 },
      { label: "No obvious common words or sequences", passed: !!value && !common },
      { label: "No repeated character patterns", passed: !!value && !repeated },
      {
        label: "Multiple character types or a long passphrase",
        passed: variety >= 3 || value.length >= 20,
      },
    ],
  };
}
export function usePasswordStrength() {
  const password = ref("");
  const visible = ref(false);
  const assessment = computed(() => assessPassword(password.value));
  return { password, visible, assessment };
}
