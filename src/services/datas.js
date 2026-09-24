// Datas no fuso local do navegador. Consultas guardam data "AAAA-MM-DD" e
// hora "HH:MM" como o <input type="date"> e o <input type="time"> entregam.

const doisDigitos = (n) => String(n).padStart(2, '0')

export function dataLocalISO(instante = Date.now()) {
  const d = new Date(instante)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

/** Instante (ms) de uma data e hora locais; NaN se inválidas. */
export function instanteDe(data, hora) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) return Number.NaN
  const [ano, mes, dia] = data.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  const d = new Date(ano, mes - 1, dia, h, m)
  // new Date "corrige" 31/02 para 03/03; rejeita em vez de aceitar outra data.
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia || d.getHours() !== h) {
    return Number.NaN
  }
  return d.getTime()
}

const formatador = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatarData(data) {
  return formatador.format(new Date(instanteDe(data, '00:00')))
}
