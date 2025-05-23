function buscarCEP() {

    let cep = document.getElementById("inputCEPClient").value

    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`

    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            document.getElementById("inputAddressClient").value = dados.logradouro
            document.getElementById("inputNeighborhoodClient").value = dados.bairro
            document.getElementById("inputCityClient").value = dados.localidade
            document.getElementById("inputUfClient").value = dados.uf
        })
        .catch(error => console.log(error))
}

function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '')

    if (valor.length <= 2) {
        input.value = `(${valor}`
    } else if (valor.length <= 6) {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2)}`
    } else {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`
    }
}

function validarCPF(input) {
    var cpf = input.value.replace(/\D/g, '')

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        input.setCustomValidity("CPF inválido!")
        return false
    }

    var soma = 0
    var peso = 10
    for (var i = 0; i < 9; i++) {
        soma += cpf[i] * peso
        peso--
    }
    var resto = soma % 11
    var primeiroDigito = (resto < 2) ? 0 : 11 - resto

    soma = 0
    peso = 11
    for (var i = 0; i < 10; i++) {
        soma += cpf[i] * peso
        peso--
    }
    resto = soma % 11
    var segundoDigito = (resto < 2) ? 0 : 11 - resto

    if (cpf[9] == primeiroDigito && cpf[10] == segundoDigito) {
        input.setCustomValidity("")
        return true
    } else {
        input.setCustomValidity("CPF inválido!")
        return false
    }
}

let arrayClient = []

const foco = document.getElementById('searchClient')

document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    btnCreate.disabled = false
    foco.focus()
})

let frmClient = document.getElementById("frmClient")
let nameClient = document.getElementById("inputNameClient")
let cpfClient = document.getElementById("inputCPFClient")
let emailClient = document.getElementById("inputEmailNameClient")
let foneClient = document.getElementById("inputIPhoneClient")
let cepClient = document.getElementById("inputCEPClient")
let logClient = document.getElementById("inputAddressClient")
let numClient = document.getElementById("inputNumberClient")
let complementoClient = document.getElementById("inputComplementClient")
let bairroClient = document.getElementById("inputNeighborhoodClient")
let cidadeClient = document.getElementById("inputCityClient")
let ufClient = document.getElementById("inputUfClient")

function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

function restaurarEnter() {
    frmClient.removeEventListener("keydown", teclaEnter)
}

frmClient.addEventListener("keydown", teclaEnter)

function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})

window.electron.onReceiveMessage('reset-cpf', () => {
    inputCPFClient.value = ""
    inputCPFClient.focus()
    inputCPFClient.style.border = '2px solid red'
})

frmClient.addEventListener('submit', async (event) => {
    event.preventDefault()

    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        emailCli: emailClient.value,
        foneCli: foneClient.value,
        cepCli: cepClient.value,
        logCli: logClient.value,
        numCli: numClient.value,
        complementoCli: complementoClient.value,
        bairroCli: bairroClient.value,
        cidadeCli: cidadeClient.value,
        ufCli: ufClient.value
    }
    api.newClient(client)
})

api.setName((args) => {

    const busca = document.getElementById('searchClient').value.trim()
    const nomeCampo = document.getElementById('inputNameClient')
    const cpfCampo = document.getElementById('inputCPFClient')
    const foco = document.getElementById('searchClient')

    foco.value = ""

    const cpfRegex = /^\d{11}$/
    if (cpfRegex.test(busca.replace(/\D/g, ''))) {
        cpfCampo.value = busca
        cpfCampo.focus()
    } else {
        nomeCampo.value = busca
        nomeCampo.focus()
    }
})

function buscarCliente() {
    nameClient.value = ''
    cpfClient.value = ''
    emailClient.value = ''
    foneClient.value = ''
    cepClient.value = ''
    logClient.value = ''
    numClient.value = ''
    complementoClient.value = ''
    bairroClient.value = ''
    cidadeClient.value = ''
    ufClient.value = ''

    btnCreate.disabled = false
    btnUpdate.disabled = true
    btnDelete.disabled = true

    const cliValor = document.getElementById('searchClient').value.trim();
    if (cliValor === "") {
        api.validateSearch()
    } else {
        api.searchName(cliValor);

        api.renderClient((event, client) => {
            const clientData = JSON.parse(client)
            if (clientData.length > 0) {
                clientData.forEach((c) => {
                    nameClient.value = c.nomeCliente,
                        cpfClient.value = c.cpfCliente,
                        emailClient.value = c.emailCliente,
                        foneClient.value = c.foneCliente,
                        cepClient.value = c.cepCliente,
                        logClient.value = c.logradouroCliente,
                        numClient.value = c.numeroCliente,
                        complementoClient.value = c.complementoCliente,
                        bairroClient.value = c.bairroCliente,
                        cidadeClient.value = c.cidadeCliente,
                        ufClient.value = c.ufCliente

                    restaurarEnter()
                    btnCreate.disabled = true
                    btnUpdate.disabled = false
                    btnDelete.disabled = false
                })
            }
        })
    }
}

const btnUpdate = document.getElementById('btnUpdate')

function preencherFormulario(cliente) {
    nameClient.value = c.nomeCliente
    cpfClient.value = c.cpfCliente
    emailClient.value = c.emailCliente
    foneClient.value = c.foneCliente
    cepClient.value = c.cepCliente
    logClient.value = c.logradouroCliente
    numClient.value = c.numeroCliente
    complementoClient.value = c.complementoCliente
    bairroClient.value = c.bairroCliente
    cidadeClient.value = c.cidadeCliente
    ufClient.value = c.ufCliente

    btnUpdate.disabled = false
}

btnUpdate.addEventListener('click', (event) => {
    event.preventDefault()

    const dadosAtualizados = {
        nome: nameClient.value,
        cpf: cpfClient.value,
        email: emailClient.value,
        telefone: foneClient.value,
        cep: cepClient.value,
        logradouro: logClient.value,
        numero: numClient.value,
        complemento: complementoClient.value,
        bairro: bairroClient.value,
        cidade: cidadeClient.value,
        uf: ufClient.value
    }

    api.updateClientes(dadosAtualizados)
})

function searchClient(cpf) {
}

function excluirCliente() {
    const cpf = cpfClient.value

    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        api.deleteClient(cpf)
    }
}

const searchInput = document.getElementById('searchClient')
const suggestionList = document.getElementById('suggestionList')

searchInput.addEventListener('input', () => {
    const busca = searchInput.value.trim()
    if (busca.length >= 1) {
        api.buscarSugestoes(busca)
    } else {
        suggestionList.innerHTML = ""
    }
})

api.retornarSugestoes((event, sugestoes) => {
    suggestionList.innerHTML = ""
    const lista = JSON.parse(sugestoes)

    lista.forEach(cli => {
        const li = document.createElement('li')
        li.textContent = `${cli.nomeCliente} (${cli.cpfCliente})`
        li.addEventListener('click', () => {
            searchInput.value = cli.cpfCliente
            suggestionList.innerHTML = ""
            buscarCliente()
        })
        suggestionList.appendChild(li)
    })
})

document.addEventListener('click', (e) => {
    if (!suggestionList.contains(e.target) && e.target !== searchInput) {
        suggestionList.innerHTML = ""
    }
})
