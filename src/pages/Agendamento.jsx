import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Campo } from '../components/Campo.jsx'
import { Carregando, ErroCarregamento, Vazio } from '../components/EstadoTela.jsx'
import ui from '../components/ui.module.css'
import { LIMITE_OBSERVACOES, rotuloDoTipo, TIPOS_CONSULTA } from '../contexts/appointmentsReducer.js'
import { useAppointments } from '../contexts/useAppointments.js'
import { usePacientes } from '../hooks/usePacientes.js'
import { useTituloPagina } from '../hooks/useTituloPagina.js'
import { dataLocalISO, formatarData } from '../services/datas.js'
import styles from './Agendamento.module.css'

const ORDEM_CAMPOS = ['pacienteId', 'data', 'hora', 'tipo', 'observacoes']
const camposVazios = (pacienteId = '') => ({ pacienteId, data: '', hora: '', tipo: '', observacoes: '' })

export function Agendamento() {
  useTituloPagina('Agendar consulta')
  const [parametros] = useSearchParams()
  const { pacientes, status, erro: erroPacientes, recarregar } = usePacientes()
  const { futuras, agendar, cancelar } = useAppointments()

  // Chegando de "Agendar consulta" na lista de pacientes, o paciente já vem escolhido.
  const [campos, setCampos] = useState(() => camposVazios(parametros.get('paciente') ?? ''))
  const [erros, setErros] = useState({})
  const [aviso, setAviso] = useState('')

  function atualizar(nome) {
    return (evento) => {
      setCampos((atual) => ({ ...atual, [nome]: evento.target.value }))
      setErros(({ [nome]: _removido, ...resto }) => resto)
    }
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    const paciente = pacientes.find((p) => String(p.id) === campos.pacienteId)
    const resultado = agendar({
      ...campos,
      pacienteId: paciente ? paciente.id : null,
      pacienteNome: paciente?.nome ?? '',
    })

    if (!resultado.ok) {
      setErros(resultado.erros)
      setAviso('')
      const primeiro = ORDEM_CAMPOS.find((c) => resultado.erros[c])
      document.getElementById(`campo-${primeiro}`)?.focus()
      return
    }

    const { consulta } = resultado
    setErros({})
    setCampos(camposVazios())
    setAviso(
      `Consulta agendada: ${rotuloDoTipo(consulta.tipo)} para ${consulta.pacienteNome} em ${formatarData(consulta.data)} às ${consulta.hora}.`,
    )
  }

  function aoCancelar(consulta) {
    cancelar(consulta.id)
    setAviso(`Consulta de ${consulta.pacienteNome} em ${formatarData(consulta.data)} às ${consulta.hora} cancelada.`)
  }

  const totalErros = Object.keys(erros).length

  return (
    <>
      <div className={ui.cabecalhoPagina}>
        <h1>Agendar consulta</h1>
        <p>Campos com * são obrigatórios. Data e horário não podem estar no passado.</p>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {aviso && <p className={ui.alertaSucesso}>{aviso}</p>}
      </div>

      <div className={styles.grade}>
        <section className={ui.cartao} aria-labelledby="titulo-form">
          <h2 id="titulo-form">Nova consulta</h2>

          {status === 'carregando' && <Carregando mensagem="Carregando pacientes…" />}
          {status === 'erro' && <ErroCarregamento mensagem={erroPacientes} aoTentarDeNovo={recarregar} />}
          {status === 'sucesso' && pacientes.length === 0 && (
            <Vazio titulo="Nenhum paciente disponível para agendar." />
          )}

          {status === 'sucesso' && pacientes.length > 0 && (
            <form onSubmit={aoEnviar} noValidate>
              {totalErros > 0 && (
                <p className={ui.alertaErro} role="alert">
                  {totalErros === 1 ? 'Corrija 1 campo' : `Corrija ${totalErros} campos`} para agendar.
                </p>
              )}

              <Campo id="campo-pacienteId" rotulo="Paciente" obrigatorio erro={erros.pacienteId}>
                {(aria) => (
                  <select id="campo-pacienteId" value={campos.pacienteId} onChange={atualizar('pacienteId')} {...aria}>
                    <option value="">Selecione…</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.nome} ({p.codigo})
                      </option>
                    ))}
                  </select>
                )}
              </Campo>

              <div className={styles.linha}>
                <Campo id="campo-data" rotulo="Data" obrigatorio erro={erros.data}>
                  {(aria) => (
                    <input
                      id="campo-data"
                      type="date"
                      min={dataLocalISO()}
                      value={campos.data}
                      onChange={atualizar('data')}
                      {...aria}
                    />
                  )}
                </Campo>
                <Campo id="campo-hora" rotulo="Horário" obrigatorio erro={erros.hora}>
                  {(aria) => (
                    <input id="campo-hora" type="time" value={campos.hora} onChange={atualizar('hora')} {...aria} />
                  )}
                </Campo>
              </div>

              <Campo id="campo-tipo" rotulo="Tipo de consulta" obrigatorio erro={erros.tipo}>
                {(aria) => (
                  <select id="campo-tipo" value={campos.tipo} onChange={atualizar('tipo')} {...aria}>
                    <option value="">Selecione…</option>
                    {TIPOS_CONSULTA.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.rotulo}
                      </option>
                    ))}
                  </select>
                )}
              </Campo>

              <Campo
                id="campo-observacoes"
                rotulo="Observações"
                dica={`Opcional. Até ${LIMITE_OBSERVACOES} caracteres (${campos.observacoes.length} usados).`}
                erro={erros.observacoes}
              >
                {(aria) => (
                  <textarea
                    id="campo-observacoes"
                    value={campos.observacoes}
                    onChange={atualizar('observacoes')}
                    rows={3}
                    {...aria}
                  />
                )}
              </Campo>

              <button type="submit" className={ui.botao}>
                Agendar
              </button>
            </form>
          )}
        </section>

        <section className={ui.cartao} aria-labelledby="titulo-lista">
          <h2 id="titulo-lista">Consultas agendadas ({futuras.length})</h2>
          {futuras.length === 0 ? (
            <Vazio titulo="Nenhuma consulta futura.">
              <p>As consultas agendadas no formulário aparecem aqui.</p>
            </Vazio>
          ) : (
            <ul className={styles.lista}>
              {futuras.map((c) => (
                <li key={c.id} className={styles.consulta}>
                  <div>
                    <p className={styles.quando}>
                      {formatarData(c.data)} · {c.hora}
                    </p>
                    <p className={styles.quem}>{c.pacienteNome}</p>
                    <p className={styles.tipo}>{rotuloDoTipo(c.tipo)}</p>
                    {c.observacoes && <p className={styles.obs}>{c.observacoes}</p>}
                  </div>
                  <button
                    type="button"
                    className={ui.botaoSecundario}
                    onClick={() => aoCancelar(c)}
                    aria-label={`Cancelar consulta de ${c.pacienteNome} em ${formatarData(c.data)} às ${c.hora}`}
                  >
                    Cancelar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
