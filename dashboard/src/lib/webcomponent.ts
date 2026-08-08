export function setMaxDateInputInShadow(el: any) {
  if (!el) return;

  const setMax = () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = `${today.getMonth() + 1}`.padStart(2, "0");
      const day = `${today.getDate()}`.padStart(2, "0");
      const iso = `${year}-${month}-${day}`;
      const shadow = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
      const input = shadow?.querySelector('input[type="date"]') as HTMLInputElement | null;
      if (input) input.max = iso;
    } catch (err) {
      // ignore
    }
  };

  if (el.updateComplete && typeof el.updateComplete.then === "function") {
    el.updateComplete.then(setMax).catch(setMax);
  } else {
    setTimeout(setMax, 50);
  }
}
