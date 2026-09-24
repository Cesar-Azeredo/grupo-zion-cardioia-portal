import { Link } from 'react-router-dom'
import { CartaoIndicador } from '../components/CartaoIndicador.jsx'
import ui from '../components/ui.module.css'
import { useAppointments } from '../contexts/useAppointments.js'
import { useAuth } from '../contexts/useAuth.js'
import { usePacientes } from '../contexts/usePacientes.js'
import { useTituloPagina } from '../hooks/useTituloPagina.js'
import styles from './Dashboard.module.css'

function TotalPacientes() {
  const { pacientes, status, recarregar } = usePacientes()
  if (status === 'carregando') {
    return (
      <p className={styles.estadoCartao} role="status">
        Carregando…
      </p>
    )
  }
  if (status === 'erro') {
    return (
      <div className={styles.estadoCartao} role="alert">
        <p>Não foi possível carregar.</p>
        <button type="button" className={ui.botaoSecundario} onClick={recarregar}>
          Tentar de novo
        </button>
      </div>
    )
  }
  return <p className={styles.valor}>{pacientes.length}</p>
}

export function Dashboard() {
  useTituloPagina('Painel')
  const { usuario } = useAuth()
  // Contagens vêm prontas dos seletores do AppointmentsContext.
  const { futuras, doDia, porTipo } = useAppointments()
  const maiorTipo = Math.max(1, ...porTipo.map((t) => t.total))

  return (
    <>
      <div className={ui.cabecalhoPagina}>
        <h1>Painel</h1>
        <p>Olá, {usuario.nome}. Resumo do centro de diagnóstico (dados simulados).</p>
      </div>

      <div className={styles.cartoes}>
        <CartaoIndicador rotulo="Total de pacientes" detalhe="Cadastro vindo do JSONPlaceholder">
          <TotalPacientes />
        </CartaoIndicador>
        <CartaoIndicador rotulo="Consultas agendadas" valor={futuras.length} detalhe="Futuras, a partir de agora" />
        <CartaoIndicador rotulo="Consultas de hoje" valor={doDia.length} detalhe="Todas do dia, inclusive já realizadas" />
      </div>

      <section className={`${ui.cartao} ${styles.distribuicao}`} aria-labelledby="titulo-tipos">
        <h2 id="titulo-tipos">Consultas agendadas por tipo</h2>
        {futuras.length === 0 ? (
          <p className={styles.semDados}>
            Nenhuma consulta futura. <Link to="/agendamento">Agendar a primeira</Link>.
          </p>
        ) : (
          <ul className={styles.barras}>
            {porTipo.map((t) => (
              <li key={t.tipo} className={styles.barra}>
                <span className={styles.rotuloBarra}>{t.rotulo}</span>
                <span className={styles.trilho} aria-hidden="true">
                  <span className={styles.preenchimento} style={{ width: `${(t.total / maiorTipo) * 100}%` }} />
                </span>
                <span className={styles.numero}>
                  {t.total}
                  <span className="sr-only"> {t.total === 1 ? 'consulta' : 'consultas'}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
