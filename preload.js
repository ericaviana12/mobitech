/**
 * Arquivo de pré carregamento e reforço de segurança na comunicação entre processos (IPC)
 */

// importação dos recursos do framework electron
// contextBrigde (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

// enviar ao main um pedido para conexão com o banco de dados e troca do icone no processo de renderização (index.html - renderer.html)
ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
  clientWindow: () => ipcRenderer.send('client-window'),
  osWindow: () => ipcRenderer.send('os-window'),
  dbStatus: (message) => ipcRenderer.on('db-status', message), // Trocar o ícone de banco de dados conectado ou desconectado
  newClient: (client) => ipcRenderer.send('new-client', client),
  resetForm: (args) => ipcRenderer.on('reset-form', args),
  searchName: (name) => ipcRenderer.send('search-name', name),
  renderClient: (dataClient) => ipcRenderer.on('render-client', dataClient),
  validateSearch: () => ipcRenderer.send('validate-search'),
  setName: (args) => ipcRenderer.on('set-name', args), // Trocar o nome do campo de busca e colocar no campo nome, caso não tenha esse cliente no cadastro
  updateClientes: (cliente) => ipcRenderer.send('update-clientes', cliente),
  deleteClient: (cpf) => ipcRenderer.send('delete-client', cpf),
  buscarSugestoes: (valor) => ipcRenderer.send('search-suggestions', valor),
  retornarSugestoes: (callback) => ipcRenderer.on('suggestions-found', callback),
  searchClients: () => ipcRenderer.send('search-clients'),
  listClients: (callback) => ipcRenderer.on('list-clients', callback),

  newOS: (os) => ipcRenderer.send('new-os', os),
  onResetOSForm: (callback) => ipcRenderer.on('reset-os-form', callback)

})

// Tratamento de exceção CPF duplicado
contextBridge.exposeInMainWorld('electron', {
  sendMessage: (channel, data) => { ipcRenderer.send(channel, data) },
  onReceiveMessage: (channel, callback) => { ipcRenderer.on(channel, callback) }
})