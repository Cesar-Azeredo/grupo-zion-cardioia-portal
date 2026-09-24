import ui from './ui.module.css'
import styles from './CartaoIndicador.module.css'

// Número em destaque com rótulo e explicação curta.
export function CartaoIndicador({ rotulo, valor, detalhe, children }) {
  return (
    <section className={`${ui.cartao} ${styles.cartao}`} aria-label={rotulo}>
      <h2 className={styles.rotulo}>{rotulo}</h2>
      {children ?? <p className={styles.valor}>{valor}</p>}
      {detalhe && <p className={styles.detalhe}>{detalhe}</p>}
    </section>
  )
}
