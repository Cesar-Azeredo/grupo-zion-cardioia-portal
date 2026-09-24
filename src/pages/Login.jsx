import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Campo } from '../components/Campo.jsx'
import { Rodape } from '../components/Rodape.jsx'
import ui from '../components/ui.module.css'
import { useAuth } from '../contexts/useAuth.js'
import { useTituloPagina } from '../hooks/useTituloPagina.js'
import { CREDENCIAIS_DEMO } from '../services/authService.js'
import styles from './Login.module.css'

// Rota de volta: a que o ProtectedRoute guardou em state.from, ou o painel.
function destinoDepoisDoLogin(location) {
  const from = location.state?.from
  if (!from?.pathname || from.pathname === '/login') return '/dashboard'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

export function Login() {
  useTituloPagina('Entrar')
  const { usuario, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const destino = destinoDepoisDoLogin(location)

  if (usuario) return <Navigate to={destino} replace />

  function aoEnviar(evento) {
    evento.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    if (!login(email, senha)) {
      setErro('E-mail ou senha incorretos. Use as credenciais de demonstração abaixo.')
      return
    }
    navigate(destino, { replace: true })
  }

  return (
    <div className={styles.pagina}>
      <main className={styles.conteudo}>
        <div className={styles.painel}>
          <p className={styles.marca}>
            <span aria-hidden="true">♥</span> CardioIA
          </p>
          <h1>Entrar no portal</h1>
          <p className={styles.subtitulo}>Centro de diagnóstico cardiológico — ambiente de simulação.</p>

          {/* Região viva sempre montada: leitores de tela anunciam a mensagem quando ela muda. */}
          <div aria-live="assertive" aria-atomic="true">
            {erro && (
              <p className={ui.alertaErro} role="alert">
                {erro}
              </p>
            )}
          </div>

          <form onSubmit={aoEnviar} noValidate>
            <Campo id="email" rotulo="E-mail" obrigatorio>
              {(aria) => (
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  {...aria}
                  aria-invalid={erro ? true : undefined}
                />
              )}
            </Campo>
            <Campo id="senha" rotulo="Senha" obrigatorio>
              {(aria) => (
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  {...aria}
                  aria-invalid={erro ? true : undefined}
                />
              )}
            </Campo>
            <button type="submit" className={`${ui.botao} ${styles.entrar}`}>
              Entrar
            </button>
          </form>

          <section className={styles.demo} aria-labelledby="titulo-demo">
            <h2 id="titulo-demo">Credenciais de demonstração</h2>
            <dl>
              <dt>E-mail</dt>
              <dd>
                <code>{CREDENCIAIS_DEMO.email}</code>
              </dd>
              <dt>Senha</dt>
              <dd>
                <code>{CREDENCIAIS_DEMO.senha}</code>
              </dd>
            </dl>
            <p>A sessão expira em 1 hora. O token fica no localStorage apenas para fins didáticos.</p>
          </section>
        </div>
      </main>
      <Rodape />
    </div>
  )
}
