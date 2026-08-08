/** Define o max do input[type=date] dentro do shadow DOM do web component. */
export function setMaxDateInputInShadow(el: any): void {
  if (!el) return;
  const setMax = () => {
    try {
      const today = new Date();
      const iso = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;
      const shadow = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
      const input = shadow?.querySelector('input[type="date"]') as HTMLInputElement | null;
      if (input) input.max = iso;
    } catch {
      /* ignore */
    }
  };
  if (el.updateComplete?.then) el.updateComplete.then(setMax).catch(setMax);
  else setTimeout(setMax, 50);
}

/**
 * Janela de páginas estilo MUI: extremos + janela ao redor da atual, com
 * reticências só onde há lacuna (mesma lógica do extrato React).
 */
export function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  const siblingCount = 2;
  const boundaryCount = 1;
  const range = (start: number, end: number) =>
    Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  if (total <= totalNumbers + 2) return range(1, total);

  const startPages = range(1, boundaryCount);
  const endPages = range(total - boundaryCount + 1, total);
  const siblingsStart = Math.max(
    Math.min(current - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] - 2,
  );

  const items: (number | 'ellipsis')[] = [...startPages];
  if (siblingsStart > boundaryCount + 2) items.push('ellipsis');
  else if (boundaryCount + 1 < total - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < total - boundaryCount - 1) items.push('ellipsis');
  else if (total - boundaryCount > boundaryCount) items.push(total - boundaryCount);
  items.push(...endPages);
  return items;
}
