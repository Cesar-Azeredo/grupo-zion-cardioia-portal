import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Carregando, ErroCarregamento, Vazio } from '../components/EstadoTela.jsx'
import ui from '../components/ui.module.css'
import { rotuloDoTipo } from '../contexts/appointmentsReducer.js'
import { useAppointments } from '../contexts/useAppointments.js'
import { usePacientes } from '../contexts/usePacientes.js'
import { useTituloPagina } from '../hooks/useTituloPagina.js'
import { formatarData } from '../services/datas.js'
import { filtrarPorNome } from '../services/pacientesService.js'
import styles from './Pacientes.module.css'

export function Pacientes() {
  useTituloPagina('Pacientes')
  const { pacientes, status, erro, recarregar } = usePacientes()
  // Campo derivado, não inventado: a próxima consulta vem das consultas agendadas.
  const { proximaPorPaciente } = useAppointments()
  const [busca, setBusca] = useState('')

  const filtrados = filtrarPorNome(pacientes, busca)

  return (
    <>
      <div className={ui.cabecalhoPagina}>
        <h1>Pacientes</h1>
        <p>
          Nomes fictícios do JSONPlaceholder. A idade é <strong>simulada</strong> a partir do código do
          paciente; a próxima consulta vem dos agendamentos feitos neste portal.
        </p>
      </div>

      <div className={styles.busca}>
        <label htmlFor="busca-nome">Buscar por nome</label>
        <input
          id="busca-nome"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Ex.: Clementine"
          aria-describedby="resultado-busca"
          disabled={status !== 'sucesso'}
        />
      </div>

      {status === 'carregando' && <Carregando mensagem="Carregando pacientes…" />}
      {status === 'erro' && <ErroCarregamento mensagem={erro} aoTentarDeNovo={recarregar} />}

      {status === 'sucesso' && (
        <>
          <p id="resultado-busca" className={styles.contagem} aria-live="polite">
            {filtrados.length === 1 ? '1 paciente encontrado' : `${filtrados.length} pacientes encontrados`}
          </p>

          {pacientes.length === 0 && (
            <Vazio titulo="Nenhum paciente cadastrado.">
              <p>O serviço respondeu com uma lista vazia.</p>
            </Vazio>
          )}

          {pacientes.length > 0 && filtrados.length === 0 && (
            <Vazio titulo={`Nenhum paciente com “${busca.trim()}” no nome.`}>
              <button type="button" className={ui.botaoSecundario} onClick={() => setBusca('')}>
                Limpar busca
              </button>
            </Vazio>
          )}

          {filtrados.length > 0 && (
            <ul className={styles.lista}>
              {filtrados.map((p) => {
                const proxima = proximaPorPaciente.get(p.id)
                return (
                  <li key={p.id} className={`${ui.cartao} ${styles.item}`}>
                    <h2 className={styles.nome}>{p.nome}</h2>
                    <dl className={styles.dados}>
                      <div>
                        <dt>Código</dt>
                        <dd>{p.codigo}</dd>
                      </div>
                      <div>
                        <dt>
                          Idade <span className={ui.selo}>simulado</span>
                        </dt>
                        <dd>{p.idade} anos</dd>
                      </div>
                      <div className={styles.proxima}>
                        <dt>Próxima consulta</dt>
                        <dd>
                          {proxima ? (
                            <>
                              {formatarData(proxima.data)} · {proxima.hora}
                              <span className={styles.tipoConsulta}>{rotuloDoTipo(proxima.tipo)}</span>
                            </>
                          ) : (
                            <span className={styles.semConsulta}>Sem consulta agendada</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to={`/agendamento?paciente=${p.id}`}
                      className={ui.botaoSecundario}
                      aria-label={`Agendar consulta para ${p.nome}`}
                    >
                      Agendar
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </>
  )
}
