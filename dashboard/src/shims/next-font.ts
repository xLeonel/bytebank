/**
 * Shim de `next/font/google`. A fonte Inter é carregada via @fontsource no
 * entry do remote; aqui só devolvemos o shape esperado ({ variable, className })
 * para que o código da Fase 1 (layout) não quebre.
 */
type FontResult = { variable: string; className: string; style: { fontFamily: string } };

function font(): FontResult {
  return { variable: 'font-inter', className: '', style: { fontFamily: 'Inter Variable, sans-serif' } };
}

export function Inter(): FontResult {
  return font();
}
export default font;
