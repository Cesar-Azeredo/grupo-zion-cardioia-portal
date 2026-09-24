import { useEffect } from 'react'

// Atualiza o título da aba a cada página: leitores de tela anunciam o título
// ao trocar de rota, e a aba fica identificável.
export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = `${titulo} · CardioIA Portal`
  }, [titulo])
}
