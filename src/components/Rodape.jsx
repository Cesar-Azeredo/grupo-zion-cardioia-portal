import styles from './Rodape.module.css'

export function Rodape() {
  return (
    <footer className={styles.rodape}>
      <p>
        <strong>Simulação acadêmica</strong> — CardioIA, FIAP · Grupo Zion. Dados fictícios, sem back-end
        real. Não use para decisão clínica.
      </p>
    </footer>
  )
}
