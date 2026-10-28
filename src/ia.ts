// ─────────────────────────────────────────────────────────────
// ia.ts · Tot el que parla amb la IA és en aquest fitxer.
// Hi ha DUES maneres de preguntar (opció A i opció B) per
// veure la diferència entre enviar o no enviar l'historial.
// ─────────────────────────────────────────────────────────────

// Un missatge de la conversa: qui parla (role) i què diu (content)
export type Missatge = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// El model que farem servir a Groq (gratuït)
const MODEL = 'openai/gpt-oss-20b';

// Instrucció inicial: li diu a la IA com s'ha de comportar
const INSTRUCCIO: Missatge = {
  role: 'system',
  content: 'Ets un assistent amable. Respon sempre en català i amb poques frases.',
};

// Envia una llista de missatges a la IA i retorna el text de la seva resposta
async function enviarALaIA(missatges: Missatge[]): Promise<string> {
  console.log('Enviem a la IA', missatges.length, 'missatges:', missatges);

  const resposta = await fetch('/api/ia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: missatges }),
  });

  if (!resposta.ok) {
    throw new Error(`Error ${resposta.status}. Revisa la clau del fitxer .env`);
  }

  const dades = await resposta.json();
  return dades.choices[0].message.content;
}

// ─── OPCIÓ A · SENSE HISTORIAL ───────────────────────────────
// Només enviem la pregunta d'ara. La IA no sap res del que
// s'ha dit abans: cada pregunta és com començar de zero.
export function preguntarSenseHistorial(pregunta: string): Promise<string> {
  const missatges: Missatge[] = [
    INSTRUCCIO,
    { role: 'user', content: pregunta }, // només la pregunta d'ara
  ];
  return enviarALaIA(missatges);
}

// ─── OPCIÓ B · AMB HISTORIAL ─────────────────────────────────
// Enviem TOTA la conversa i, al final, la pregunta d'ara.
// Així la IA «recorda» el que s'ha dit abans.
export function preguntarAmbHistorial(historial: Missatge[], pregunta: string): Promise<string> {
  const missatges: Missatge[] = [
    INSTRUCCIO,
    ...historial, // tots els missatges anteriors
    { role: 'user', content: pregunta }, // i la pregunta d'ara
  ];
  return enviarALaIA(missatges);
}
