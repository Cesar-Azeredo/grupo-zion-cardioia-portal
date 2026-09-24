import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth.js'
import { Rodape } from './Rodape.jsx'
import styles from './Layout.module.css'

const LINKS = [
  { para: '/dashboard', rotulo: 'Painel' },
  { para: '/pacientes', rotulo: 'Pacientes' },
  { para: '/agendamento', rotulo: 'Agendar' },
]

export function Layout() {
  const { usuario, logout } = useAuth()

  return (
    <div className={styles.pagina}>
      <a className={styles.pular} href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={styles.cabecalho}>
        <div className={styles.barra}>
          <span className={styles.marca}>
            <span aria-hidden="true">♥</span> CardioIA
          </span>
          <div className={styles.sessao}>
            <span className={styles.usuario}>{usuario?.nome}</span>
            <button type="button" className={styles.sair} onClick={logout}>
              Sair
            </button>
          </div>
        </div>
        <nav aria-label="Navegação principal" className={styles.nav}>
          <ul>
            {LINKS.map(({ para, rotulo }) => (
              <li key={para}>
                <NavLink to={para} className={({ isActive }) => (isActive ? styles.ativo : undefined)}>
                  {rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1} className={styles.conteudo}>
        <Outlet />
      </main>
      <Rodape />
    </div>
  )
}
