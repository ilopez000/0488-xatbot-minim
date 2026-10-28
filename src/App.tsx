import { useState, type FormEvent } from 'react';
import { preguntarAmbHistorial, preguntarSenseHistorial, type Missatge } from './ia';

export default function App() {
  const [text, setText] = useState(''); // el que s'escriu a la caixa
  const [xatA, setXatA] = useState<Missatge[]>([]); // conversa de l'opció A (sense historial)
  const [xatB, setXatB] = useState<Missatge[]>([]); // conversa de l'opció B (amb historial)
  const [esperant, setEsperant] = useState(false); // true mentre la IA pensa
  const [error, setError] = useState('');

  async function enviar(e: FormEvent) {
    e.preventDefault(); // que el formulari no recarregui la pàgina
    const pregunta = text.trim();
    if (pregunta === '' || esperant) return;

    const meu: Missatge = { role: 'user', content: pregunta };
    setXatA([...xatA, meu]); // pintem la pregunta a les dues columnes
    setXatB([...xatB, meu]);
    setText('');
    setError('');
    setEsperant(true);

    try {
      // La MATEIXA pregunta, enviada de les dues maneres
      const respostaA = await preguntarSenseHistorial(pregunta);
      const respostaB = await preguntarAmbHistorial(xatB, pregunta);

      setXatA([...xatA, meu, { role: 'assistant', content: respostaA }]);
      setXatB([...xatB, meu, { role: 'assistant', content: respostaB }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setEsperant(false);
    }
  }

  function novaConversa() {
    setXatA([]);
    setXatB([]);
    setError('');
  }

  return (
    <main>
      <h1>Xatbot mínim · amb o sense historial</h1>
      <p className="pista">
        Prova-ho: escriu <b>«Em dic Marta»</b> i després <b>«Com em dic?»</b>
      </p>

      <div className="columnes">
        <Columna
          titol="A · Sense historial"
          explicacio="Cada vegada s'envien 2 missatges: la instrucció i la pregunta."
          missatges={xatA}
        />
        <Columna
          titol="B · Amb historial"
          explicacio={`La propera pregunta enviarà ${xatB.length + 2} missatges: la instrucció, tota la conversa i la pregunta.`}
          missatges={xatB}
        />
      </div>

      {esperant && <p className="estat">La IA està pensant…</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={enviar}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escriu una pregunta…"
          aria-label="Pregunta"
        />
        <button disabled={esperant}>Envia</button>
        <button type="button" onClick={novaConversa} disabled={esperant}>
          Nova conversa
        </button>
      </form>
    </main>
  );
}

// Una columna del xat: un títol, una explicació i els missatges
type PropsColumna = { titol: string; explicacio: string; missatges: Missatge[] };

function Columna({ titol, explicacio, missatges }: PropsColumna) {
  return (
    <section className="columna">
      <h2>{titol}</h2>
      <p className="explicacio">{explicacio}</p>
      {missatges.map((m, i) => (
        <p key={i} className={m.role === 'user' ? 'bombolla meva' : 'bombolla ia'}>
          {m.content}
        </p>
      ))}
    </section>
  );
}
