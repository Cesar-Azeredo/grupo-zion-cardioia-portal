import styles from './Campo.module.css'

// Campo de formulário com rótulo, dica e mensagem de erro ligados ao
// controle por aria-describedby. children recebe as props de acessibilidade:
//   <Campo id="email" rotulo="E-mail" erro={erro}>{(aria) => <input id="email" {...aria} />}</Campo>
export function Campo({ id, rotulo, erro, dica, obrigatorio = false, children }) {
  const idDica = dica ? `${id}-dica` : null
  const idErro = erro ? `${id}-erro` : null
  const descritoPor = [idDica, idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.rotulo}>
        {rotulo}
        {obrigatorio && (
          <>
            <span aria-hidden="true" className={styles.obrigatorio}>
              {' '}
              *
            </span>
            <span className="sr-only"> (obrigatório)</span>
          </>
        )}
      </label>
      {dica && (
        <p id={idDica} className={styles.dica}>
          {dica}
        </p>
      )}
      {children({ 'aria-invalid': erro ? true : undefined, 'aria-describedby': descritoPor, className: styles.controle })}
      {erro && (
        <p id={idErro} className={styles.erro}>
          <span aria-hidden="true">⚠ </span>
          {erro}
        </p>
      )}
    </div>
  )
}
