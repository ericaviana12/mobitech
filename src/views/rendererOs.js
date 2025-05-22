// ===========================================================
// == Busca avançada =========================================

// Pegar elementos do DOM
const inputSearchClientOs = document.getElementById('inputSearchClientOs')
const suggestionList = document.getElementById('viewListSuggestion')
const inputIdClient = document.getElementById('inputIdClient')
const inputNameClient = document.getElementById('inputNameClient')
const inputPhoneClient = document.getElementById('inputPhoneClient')

let arrayClients = []

inputSearchClientOs.addEventListener('input', () => {
    const search = inputSearchClientOs.value.toLowerCase()
    // Oculta a lista se o campo estiver vazio
    if (search === '') {
        suggestionList.innerHTML = ""
        return
    }

    // Solicitar a busca dos clientes no main
    window.api.searchClients()

    // Ouvir a resposta da lista de clientes
    window.api.listClients((event, clientsJson) => {
        const clients = JSON.parse(clientsJson)
        arrayClients = clients

        // Filtrar clientes pelo nome que contém o texto digitado
        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10)

        suggestionList.innerHTML = ""

        results.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item', 'list-group-item-action')
            item.textContent = c.nomeCliente

            // Quando clicar no nome do cliente, preencher o formulário da OS
            item.addEventListener('click', () => {
                inputIdClient.value = c._id
                inputNameClient.value = c.nomeCliente
                inputPhoneClient.value = c.foneCliente
                inputSearchClientOs.value = ""
                suggestionList.innerHTML = ""
            })

            suggestionList.appendChild(item)
        })
    })
})

// Ocultar a lista ao clicar fora do campo ou da lista
document.addEventListener('click', (e) => {
    if (!inputSearchClientOs.contains(e.target) && !suggestionList.contains(e.target)) {
        suggestionList.innerHTML = ""
    }
})

// == Fim - busca avançada =====================================
// =============================================================


// ============================================================
// CRUD Create ================================================

const osStatus = document.getElementById('osStatus')
const inputMovel = document.getElementById('inputMovel')
const inputMarca = document.getElementById('inputMarca')
const inputVolumes = document.getElementById('inputVolumes')
const inputAmbiente = document.getElementById('inputAmbiente')
const inputProblemas = document.getElementById('inputProblemas')
const inputMaterial = document.getElementById('inputMaterial')
const inputMontador = document.getElementById('inputMontador')
const inputObservacoes = document.getElementById('inputObservacoes')
const inputValor = document.getElementById('inputValor')

frmOS.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!inputIdClient.value) {
        // Se não selecionou cliente, mostrar alerta e não criar OS
        alert("É obrigatório vincular um cliente na Ordem de Serviço")
        return
    }

    // Construir objeto OS para enviar ao main
    const os = {
        idCliente: inputIdClient.value,
        nomeCliente: inputNameClient.value,
        telefoneCliente: inputPhoneClient.value,
        statusOs: osStatus.value,
        tipoMovel: inputMovel.value,
        marcaMovel: inputMarca.value,
        numVolumes: inputVolumes.value,
        ambienteMontagem: inputAmbiente.value,
        problemasRelatados: inputProblemas.value,
        materialNecessario: inputMaterial.value,
        montadorResponsavel: inputMontador.value,
        observacoes: inputObservacoes.value,
        valor: parseFloat(inputValor.value) || 0,
        dataEntrada: new Date().toISOString(), // pode usar data atual
    }

    console.log("Objeto OS para criação:", os)

    // Enviar para o main via preload (usar canal new-os, por exemplo)
    window.api.newOS(os)
})

window.api.onResetOSForm(() => {
    frmOS.reset()
    inputIdClient.value = ""
    inputNameClient.value = ""
    inputPhoneClient.value = ""
    txtOs.value = "" // se quiser limpar
    inputData.value = "" // se quiser limpar
})

// FIM - CRUD Create ==========================================
// ============================================================
