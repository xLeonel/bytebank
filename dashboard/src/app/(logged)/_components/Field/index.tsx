import type { Props } from "./types";

export { BTN_DANGER_CLS, BTN_PRIMARY_CLS, INPUT_CLS, INPUT_DISABLED_CLS } from "./constants";

export function Field({ label, children }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}
