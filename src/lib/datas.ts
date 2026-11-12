/**
 * Datas como texto ISO (AAAA-MM-DD), sem horário, para evitar erro de fuso.
 * O "hoje" do produto é o de São Paulo, não o do servidor (UTC no Vercel).
 */

const FUSO = "America/Sao_Paulo";
const DIA_MS = 86_400_000;

/** Data de hoje em São Paulo, no formato AAAA-MM-DD. */
export function hojeISO(agora: Date = new Date()): string {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

function emMs(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** Verdadeiro para uma data real no formato AAAA-MM-DD (recusa 31/02). */
export function dataISOValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const ms = emMs(iso);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === iso;
}

/** Dias de `de` até `ate` (negativo se `ate` for antes). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((emMs(ate) - emMs(de)) / DIA_MS);
}

export function somarDias(iso: string, dias: number): string {
  return new Date(emMs(iso) + dias * DIA_MS).toISOString().slice(0, 10);
}

/** AAAA-MM-DD para DD/MM/AAAA. */
export function formatarData(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
