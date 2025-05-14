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
            document.getElementById("inputTSateClient").value = dados.localidade
            document.getElementById("uf").value = dados.uf
        })
        .catch(error => console.log(error))
}

//Vetor global que sera usado na manipulação dos dados
let arrayClient = []

// Capturar o foco na busca pelo nome cliente
//A constante "foco" obtem o elemento html(input) indentificado como "searchClinet"
const foco = document.getElementById('searchClient');

//Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botão 
    btnUpdate.disabled = true;
    btnDelete.disabled = true;
    //Foco na busca do cliente
    foco.focus();
});

//captura dos dados dos inputs do formulário (Passo 1: fluxo)
let frmClient = document.getElementById("frmClient");
let nameClient = document.getElementById("inputNameClient");
let cpfClient = document.getElementById("inputCPFClient");
let emailClient = document.getElementById("inputEmailNameClient");
let foneClient = document.getElementById("inputIPhoneClient");
let cepClient = document.getElementById("inputCEPClient");
let logClient = document.getElementById("inputAddressClient");
let numClient = document.getElementById("inputNumberClient");
let complementoClient = document.getElementById("inputComplementClient");
let bairroClient = document.getElementById("inputNeighborhoodClient");
let cidadeClient = document.getElementById("inputTSateClient");
let ufClient = document.getElementById("inputUfClient");

//Captura do id do cliente (usado no delete e update)
let id = document.getElementById('idClient');

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
    let cpfSemFormatacao = cpfClient.value.replace(/\D/g, "");
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

//Reset form===================================================================
function resetForm() {
    //Limpar os campos e resetar o formulário com as configurações pré definidas
    location.reload() //Recarrega a página
}

//Recebimento do pedido do main para resetar o formulário
api.resetForm((args) => {
    resetForm()
})

//Fim reset form===================================================================

// === Função para aplicar máscara no CPF ===
function aplicarMascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

    campo.value = cpf;
}

// === Função para validar CPF ===
function validarCPF() {
    let campo = document.getElementById('inputCPFClient');
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    campo.style.borderColor = "green";
    campo.style.color = "green";
    return true;
}

// Adicionar eventos para CPF
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient)); // Máscara ao digitar
cpfClient.addEventListener("blur", validarCPF); // Validação ao perder o foco


//parte 2, subir pro banco sem ponto

// == CRUD Creat/Update ==================================

// == CRUD Delete ==================================

function excluirCliente(){
    console.log(id.value)//Passo 1: receber do form o id
    api.deleteClient(id.value)//Passo 2: enviar o id ao main
}

// == FIM CRUD Delete ==================================
