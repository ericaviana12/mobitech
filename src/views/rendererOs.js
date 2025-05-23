// ===========================================================
// == Busca avançada =========================================

const input = document.getElementById('inputSearchClient')
const suggestionList = document.getElementById('viewListSuggestion')
let idClient = document.getElementById('inputIdClient')
let nameClient = document.getElementById('inputNameClient')
let phoneClient = document.getElementById('inputPhoneClient')

let arrayClients = []

input.addEventListener('input', () => {
    const search = input.value.toLowerCase() // Captura o que foi digitado e converte tudo para minúsculo
    suggestionList.innerHTML = ""

    // Buscar os nomes dos clientes no banco
    api.searchClients()

    // Listar os clientes 
    api.listClients((event, clients) => {
        const listaClientes = JSON.parse(clients)
        arrayClients = listaClientes

        // Filtra os clientes cujo nome (c.nomeCliente) contém o texto digitado(search)
        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10) // máximo 10 nomes

        suggestionList.innerHTML = "" // Limpa novamente após possível atraso

        // Para cada resultado, cria um item da lista
        results.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item', 'list-group-item-action')
            item.textContent = c.nomeCliente

            // Adiciona evento de clique no ítem da lista para preencher os campos do form
            item.addEventListener('click', () => {
                idClient.value = c._id
                nameClient.value = c.nomeCliente
                phoneClient.value = c.foneCliente
                input.value = ""
                suggestionList.innerHTML = ""
            })

            // Adiciona os nomes (itens <li>) a lista <ul>
            suggestionList.appendChild(item)
        })
    })
})

// Setar o foco no campo de busca (validação de busca do cliente obrigatória)
api.setSearch((args) => {
    input.focus()
})

// Ocultar lista ao clicar fora
document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionList.contains(e.target)) {
        suggestionList.innerHTML = ""
    }
})

// == Fim - busca avançada =====================================
// =============================================================

// Iniciar a janela OS alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    // Desativar os botões
    btnUpdate.disabled = true
    btnDelete.disabled = true
})

// Criar um vetor para manipulação dos dados da OS
let arrayOS = []

// captura dos IDs do form OS
let frmOS = document.getElementById('frmOS')
let statusOS = document.getElementById('inputStatus')
let furniture = document.getElementById('inputFurniture')
let model = document.getElementById('inputModel')
let volumes = document.getElementById('inputVolumes')
let environment = document.getElementById('inputEnvironment')
let problem = document.getElementById('inputProblem')
let material = document.getElementById('inputMaterial')
let specialist = document.getElementById('inputSpecialist')
let obs = document.getElementById('inputObs')
let total = document.getElementById('inputTotal')
// captura do id da OS (CRUD Delete e Update)
let idOS = document.getElementById('inputOS')
// captura do id do campo data
let dateOS = document.getElementById('inputData')

// ============================================================
// == Reset form ==============================================

function resetForm() {
    // Limpar os campos e resetar o formulário com as configurações pré definidas
    location.reload()
}

// Recebimento do pedido do main para resetar o form
api.resetForm((args) => {
    resetForm()
})

// == Fim - reset form ========================================
// ============================================================


// ============================================================
// == CRUD Create =============================================

function criarOS() {
    const os = {
        idClient_OS: idClient.value,
        stat_OS: statusOS.value,
        furniture_OS: furniture.value,
        model_OS: model.value,
        volumes_OS: volumes.value,
        environment_OS: environment.value,
        problem_OS: problem.value,
        material_OS: material.value,
        specialist_OS: specialist.value,
        obs_OS: obs.value,
        total_OS: total.value
    }
    api.newOS(os)
}

// == Fim - CRUD Create =======================================
// ============================================================


// ============================================================
// == CRUD Read ===============================================

function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {
    console.log(dataOS)
    const os = JSON.parse(dataOS)
    // preencher os campos com os dados da OS
    idOS.value = os._id
    // formatar data
    const data = new Date(os.dataEntrada)
    const formatada = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })

    dateOS.value = formatada
    idClient.value = os.idCliente
    statusOS.value = os.statusOS
    furniture.value = os.movel
    model.value = os.modelo
    volumes.value = os.volumes
    environment.value = os.ambiente
    problem.value = os.problema
    material.value = os.material
    specialist.value = os.montador
    obs.value = os.observacao
    total.value = os.valor
    // desativar o botão adicionar
    btnCreate.disabled = true
    // ativar os botões editar e excluir
    btnUpdate.disabled = false
    btnDelete.disabled = false
})

// == Fim - CRUD Read =========================================
// ============================================================


// ============================================================
// == CRUD Update =============================================

function atualizarOS() {
    const osEditada = {
        _id: idOS.value, // importante passar o ID para localizar no banco
        idCliente: idClient.value,
        statusOS: statusOS.value,
        movel: furniture.value,
        modelo: model.value,
        volumes: volumes.value,
        ambiente: environment.value,
        problema: problem.value,
        material: material.value,
        montador: specialist.value,
        observacao: obs.value,
        valor: total.value
    }
    api.updateOS(osEditada)
}

// evento submit que decide qual função chamar
frmOS.addEventListener('submit', (event) => {
    event.preventDefault()

    if (idClient.value === "") {
        api.validateClient()
        return
    }

    console.log(
        idOS.value,
        idClient.value,
        statusOS.value,
        furniture.value,
        model.value,
        volumes.value,
        environment.value,
        problem.value,
        material.value,
        specialist.value,
        obs.value,
        total.value
    )

    if (idOS.value === "") {
        criarOS()
    } else {
        atualizarOS()
    }
})

// == Fim - CRUD Update =======================================
// ============================================================


// ============================================================
// == CRUD Delete =============================================

function removeOS() {
    console.log(idOS.value) // Passo 1 (receber do form o id da OS)
    api.deleteOS(idOS.value) // Passo 2 (enviar o id da OS ao main)
}

// == Fim - CRUD Delete =======================================
// ============================================================


// ============================================================
// == Imprimir OS =============================================

const btnPrintOS = document.getElementById('btnPrintOS')

btnPrintOS.addEventListener('click', () => {
    if (!idOS.value) {
        alert("Nenhuma OS carregada para imprimir!")
        return
    }
    imprimirOS()
})

function imprimirOS() {
    // Monta o conteúdo para impressão
    const conteudo = `
        <html>
        <head>
            <title>Ordem de Serviço - ${idOS.value}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 40px;
                    color: #333;
                }

                h1 {
                    text-align: center;
                    font-size: 28px;
                    margin-bottom: 20px;
                    color: #005B8F;
                }

                .os-container {
                    border: 2px solid #005B8F;
                    padding: 20px;
                    border-radius: 8px;
                }

                .section {
                    margin-bottom: 25px;
                    padding-bottom: 10px;
                    border-bottom: 1px dashed #aaa;
                }

                .section:last-child {
                    border-bottom: none;
                }

                .label {
                    font-weight: 600;
                    color: #333;
                    display: inline-block;
                    width: 180px;
                }

                .value {
                    color: #444;
                }

                .signature {
                    text-align: center;
                    margin-top: 50px;
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            <h1>Ordem de serviço - MobiTech</h1>
            <div class="section">
                <div><span class="field-label">Número OS:</span> ${idOS.value}</div>
                <div><span class="field-label">Data:</span> ${dateOS.value}</div>
                <div><span class="field-label">Cliente ID:</span> ${idClient.value}</div>
                <div><span class="field-label">Status:</span> ${statusOS.value}</div>
            </div>

            <div class="section">
                <div><span class="field-label">Móvel:</span> ${furniture.value}</div>
                <div><span class="field-label">Modelo:</span> ${model.value}</div>
                <div><span class="field-label">Volumes:</span> ${volumes.value}</div>
                <div><span class="field-label">Ambiente:</span> ${environment.value}</div>
            </div>

            <div class="section">
                <div><span class="field-label">Problema:</span> ${problem.value}</div>
                <div><span class="field-label">Material:</span> ${material.value}</div>
                <div><span class="field-label">Montador:</span> ${specialist.value}</div>
                <div><span class="field-label">Observação:</span> ${obs.value}</div>
            </div>

            <div class="section">
                <div><span class="field-label">Total:</span> R$ ${total.value}</div>
            </div>

            <div style="text-align:center; margin-top: 50px;">
                <p>Assinatura do Cliente: ___________________________</p>
            </div>
        </body>
        </html>
    `

    // Abrir nova janela para impressão
    let janelaPrint = window.open('', '', 'width=800,height=600')
    janelaPrint.document.write(conteudo)
    janelaPrint.document.close()
    janelaPrint.focus()
    janelaPrint.print()
    janelaPrint.close()
}

// == Fim - Imprimir OS =======================================
// ============================================================
