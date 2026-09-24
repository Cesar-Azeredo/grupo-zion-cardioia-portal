import ui from './ui.module.css'
import styles from './EstadoTela.module.css'

// Estados padronizados de tela que busca dado: carregando, erro e vazio.

export function Carregando({ mensagem = 'Carregando…' }) {
  return (
    <div className={styles.estado} role="status">
      <span className={styles.giro} aria-hidden="true" />
      {mensagem}
    </div>
  )
}

export function ErroCarregamento({ mensagem, aoTentarDeNovo }) {
  return (
    <div className={`${ui.alertaErro} ${styles.erro}`} role="alert">
      <p>
        <strong>Não foi possível carregar os dados.</strong> {mensagem}
      </p>
      {aoTentarDeNovo && (
        <button type="button" className={ui.botaoSecundario} onClick={aoTentarDeNovo}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}

export function Vazio({ titulo, children }) {
  return (
    <div className={styles.vazio}>
      <p className={styles.tituloVazio}>{titulo}</p>
      {children}
    </div>
  )
}
