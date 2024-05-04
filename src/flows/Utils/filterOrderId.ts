export function filterOrderId(cadena: string): string {
  const numerosEncontrados = cadena.match(/^\d+/);
  return numerosEncontrados ? numerosEncontrados[0] : '';
}
