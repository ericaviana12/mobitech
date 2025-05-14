//Buscar
function buscarCEP() {
    //console.log("teste do evento blur");

    //Pegando a tag pelo input e colocando o valor dentro de "cep"
    let cep = document.getElementById("inputCEPClient").value
    //console.log(cep)

    //consumir a API do ViaCep
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`

    //Acessando o web service para obter os dados
    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            //Extração dos dados
            document.getElementById("inputAddressClient").value = dados.logradouro
            document.getElementById("inputNeighborhoodClient").value = dados.bairro
            document.getElementById("inputCityClient").value = dados.localidade
            document.getElementById("inputUfClient").value = dados.uf
        })
        .catch(error => console.log(error))
}

function mascaraTelefone(input) {
    // Remove tudo o que não for número
    let valor = input.value.replace(/\D/g, '')

    // Aplica a máscara (DDD)XXXXX-XXXX
    if (valor.length <= 2) {
        input.value = `(${valor}`
    } else if (valor.length <= 6) {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2)}`
    } else {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`
    }
}

function validarCPF(input) {
    var cpf = input.value.replace(/\D/g, '') // Remove tudo o que não é número

    // Verifica se o CPF tem 11 dígitos e se não é uma sequência de números iguais (ex: 11111111111)
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        input.setCustomValidity("CPF inválido!"); // Mensagem para CPF inválido
        return false
    }

    // Calcula o primeiro dígito verificador
    var soma = 0
    var peso = 10
    for (var i = 0; i < 9; i++) {
        soma += cpf[i] * peso
        peso--
    }
    var resto = soma % 11
    var primeiroDigito = (resto < 2) ? 0 : 11 - resto
    
    // Calcula o segundo dígito verificador
    soma = 0
    peso = 11
    for (var i = 0; i < 10; i++) {
        soma += cpf[i] * peso
        peso--
    }
    resto = soma % 11
    var segundoDigito = (resto < 2) ? 0 : 11 - resto

    // Verifica se os dois dígitos verificadores calculados são iguais aos informados
    if (cpf[9] == primeiroDigito && cpf[10] == segundoDigito) {
        input.setCustomValidity("") // Remove a mensagem de erro
        return true
    } else {
        input.setCustomValidity("CPF inválido!"); // Mensagem para CPF inválido
        return false
    }
}

//Vetor global que sera usado na manipulação dos dados
let arrayClient = []

// Capturar o foco na busca pelo nome cliente
//A constante "foco" obtem o elemento html(input) indentificado como "searchClinet"
const foco = document.getElementById('searchClient')

//Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botões "atualizar" e "excluir"
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Ativar o botão "adicionar"
    btnCreate.disabled = false
    //Iniciar o documento com foco na caixa de texto
    foco.focus()
})

//captura dos dados dos inputs do formulário (Passo 1: fluxo)
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

//Captura do id do cliente (usado no delete e update)
let id = document.getElementById('idClient')

//========================================================
//Manipulação da tecla "Enter"

//Função para manipular o evento da tecla ENTER
function teclaEnter(event){
    if(event.key === "Enter"){
        event.preventDefault() //Ignorar o comportamento padrão
        //Associar o Enter e busca pelo cliente
        
        buscarCliente()
    }
}

//Função para restaurar o padrão da tecla ENTER (submit)
function restaurarEnter(){
    frmClient.removeEventListener("keydown", teclaEnter)
}

//"Escuta do evento tecla Enter"
frmClient.addEventListener("keydown", teclaEnter)

//Fim da manipulação da tecla "Enter"========================

//==========================================================================
//CRUD CREATE E UPDATE

//Evento associado botão submit (uso das validações do HTML)
frmClient.addEventListener('submit', async (event) => {
    //Evitar o comportamento padrão do submit, que é enviar os dados de formulário e reiniciar o documento HTML
    event.preventDefault()
    //teste importante (recebimento dos dados do formulário) - passo 1 do fluxo
    console.log(nameClient.value, cpfClient.value, emailClient.value, foneClient.value, cepClient.value, logClient.value, numClient.value, complementoClient.value, bairroClient.value, cidadeClient.value, ufClient.value)
    // Limpa o CPF antes de salvar no banco
    let cpfSemFormatacao = cpfClient.value.replace(/\D/g, "")
    //Crair um objeto para armazenar os dados do cliente antes de enviar ao main 
    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfSemFormatacao,
        emailCli: emailClient.value,
        foneCli: foneClient.value,
        cepCli: cepClient.value,
        logfCli: logClient.value,
        numCli: numClient.value,
        complementoCli: complementoClient.value,
        bairroCli: bairroClient.value,
        cidadeCli: cidadeClient.value,
        ufCli: ufClient.value
    }

    //Enviar ao main o objeto client - Passo 2 (fluxo)
    //Uso do preload.js
    api.newClient(client)
})

//Fim crud create update====================================================

//CRUD READ====================================================================

function buscarCliente() {
    //Passo 1: Capturar o nome do cliente
    let name = document.getElementById("searchClient").value
    console.log(name);

    //Validação de campo obrigatório
    //se o campo de buscar não foi preenchido
    if (name === "") {
        //Enviar ao main um pedido para alertar o usuário
        api.validateSearch()
        foco.focus()
    } else {
        api.searchName(name);// Passo 2: envio de nome ao main

        //Recebimento dos dados cliente
        api.renderClient((event, dataClient) => {
            console.log(dataClient)//Teste passo 5
            //Passo 6: renderizar os dados do clientes no formulário
            // - Criar um vetor global para manipulação dos dados
            // - Criar uma constante para converter os dados recebidos que estão no formato string para o formato JSON
            // Usar o laço forEach para percorrer o vetor e setar os campos (caixa de textos do formula´rio)
            const dadosCliente = JSON.parse(dataClient)

            //atribuir ao array 
            arrayClient = dadosCliente
            //extrair os dados do cliente
            arrayClient.forEach((c) => {
                id.value = c._id,
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
                    //Bloqueio do botão adicionar
                    btnCreate.disabled = true
                    //Desbloqueio dos botões editar e excluir
                    btnUpdate.disabled = false
                    btnDelete.disabled = false
            });
        })
    }
}

// Setar o cliente não cadastrado
api.setClient((args) => {
    let campoBusca = document.getElementById('searchClient').value.trim()

    // Regex para verificar se o valor é só número (CPF)
    if (/^\d{11}$/.test(campoBusca)) {
        // É um número → CPF
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    } 
    else if(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(campoBusca)){
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    }
    else {
        // Não é número → Nome
        nameClient.focus()
        foco.value = ""
        nameClient.value = campoBusca
    }
})

//FIM CRUD READ====================================================================

// ==========================================================================
// == Resetar o formulário ==================================================

function resetForm() {
    // Recarregar a página
    location.reload()
}

// Uso da API reserForm quando salvar, editar ou excluir um cliente
api.resetForm((args) => {
    resetForm()
})

// == Fim - Resetar o formulário ============================================
// ==========================================================================

// == CRUD Delete ==================================

function excluirCliente(){
    console.log(id.value)//Passo 1: receber do form o id
    api.deleteClient(id.value)//Passo 2: enviar o id ao main
}

// == FIM CRUD Delete ==================================
