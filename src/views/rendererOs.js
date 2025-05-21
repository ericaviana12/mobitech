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
    suggestionList.innerHTML = ""

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