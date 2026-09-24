// Gera as capturas de tela da documentação (docs/screenshots/).
// Uso: npm run screenshots   (precisa de internet: a lista de pacientes vem
// do JSONPlaceholder; e do Chromium do Playwright: npx playwright install chromium-headless-shell)
//
// Sobe o servidor de desenvolvimento do Vite, entra com as credenciais de
// demonstração, agenda consultas pelo próprio formulário e fotografa cada
// página em 390px (celular) e 1280px (desktop). Também confere se alguma
// página tem rolagem horizontal.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { CREDENCIAIS_DEMO } from '../src/services/authService.js'
import { dataLocalISO } from '../src/services/datas.js'

const SAIDA = new URL('../docs/screenshots/', import.meta.url)
const LARGURAS = [
  { nome: 'celular', width: 390, height: 844 },
  { nome: 'desktop', width: 1280, height: 800 },
]

const DIA = 24 * 60 * 60 * 1000
const agora = new Date()
const consultasDemo = [
  { paciente: 'Clementine Bauch', data: dataLocalISO(Date.now() + DIA), hora: '09:00', tipo: 'eletrocardiograma' },
  { paciente: 'Leanne Graham', data: dataLocalISO(Date.now() + DIA), hora: '10:30', tipo: 'ecocardiograma' },
  { paciente: 'Ervin Howell', data: dataLocalISO(Date.now() + 2 * DIA), hora: '14:00', tipo: 'consulta-cardiologica' },
]
// Uma consulta para hoje, se ainda houver horário no dia.
if (agora.getHours() < 22) {
  const hora = `${String(agora.getHours() + 1).padStart(2, '0')}:00`
  consultasDemo.push({ paciente: 'Glenna Reichert', data: dataLocalISO(), hora, tipo: 'ecocardiograma' })
}

async function semRolagemHorizontal(pagina, rotulo) {
  const { largura, visivel } = await pagina.evaluate(() => ({
    largura: document.documentElement.scrollWidth,
    visivel: document.documentElement.clientWidth,
  }))
  if (largura > visivel) throw new Error(`${rotulo}: rolagem horizontal (${largura}px > ${visivel}px)`)
}

async function fotografar(pagina, arquivo, rotulo) {
  await semRolagemHorizontal(pagina, rotulo)
  await pagina.screenshot({ path: new URL(arquivo, SAIDA).pathname, fullPage: true })
  console.log(`  ✓ docs/screenshots/${arquivo}`)
}

const servidor = await createServer({ server: { port: 5188, strictPort: true }, logLevel: 'error' })
await servidor.listen()
const base = 'http://localhost:5188'
const navegador = await chromium.launch({ args: ['--lang=pt-BR'] })

try {
  await mkdir(SAIDA, { recursive: true })
  for (const { nome, width, height } of LARGURAS) {
    console.log(`${nome} (${width}px)`)
    const contexto = await navegador.newContext({ viewport: { width, height }, locale: 'pt-BR' })
    const pagina = await contexto.newPage()

    // Rota protegida sem login: tem que cair no /login.
    await pagina.goto(`${base}/pacientes`)
    await pagina.waitForURL('**/login')
    await fotografar(pagina, `login-${width}.png`, `login ${width}`)

    await pagina.getByLabel('E-mail').fill(CREDENCIAIS_DEMO.email)
    await pagina.getByLabel('Senha').fill(CREDENCIAIS_DEMO.senha)
    await pagina.getByRole('button', { name: 'Entrar' }).click()
    // ...e voltar para a página que se tentou abrir.
    await pagina.waitForURL('**/pacientes')
    await pagina.getByText(/pacientes? encontrados?/).waitFor()
    await fotografar(pagina, `pacientes-${width}.png`, `pacientes ${width}`)

    await pagina.getByRole('link', { name: 'Agendar', exact: true }).click()
    const paciente = pagina.getByLabel(/^Paciente/)
    await paciente.waitFor()
    for (const c of consultasDemo) {
      const valor = await paciente.locator('option', { hasText: c.paciente }).getAttribute('value')
      await paciente.selectOption(valor)
      await pagina.getByLabel(/^Data/).fill(c.data)
      await pagina.getByLabel(/^Horário/).fill(c.hora)
      await pagina.getByLabel(/^Tipo de consulta/).selectOption(c.tipo)
      await pagina.getByRole('button', { name: 'Agendar', exact: true }).click()
      await pagina.getByText(/^Consulta agendada/).waitFor()
    }
    await fotografar(pagina, `agendamento-${width}.png`, `agendamento ${width}`)

    // Erros por campo: envia o formulário vazio.
    await pagina.getByRole('button', { name: 'Agendar', exact: true }).click()
    await pagina.getByRole('alert').filter({ hasText: 'Corrija' }).waitFor()
    await fotografar(pagina, `agendamento-erros-${width}.png`, `agendamento com erros ${width}`)

    await pagina.getByRole('link', { name: 'Painel' }).click()
    await pagina.getByRole('region', { name: 'Total de pacientes' }).getByText(/^\d+$/).waitFor()
    await fotografar(pagina, `dashboard-${width}.png`, `dashboard ${width}`)

    await contexto.close()
  }
} finally {
  await navegador.close()
  await servidor.close()
}
