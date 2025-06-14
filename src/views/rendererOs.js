const input = document.getElementById('inputSearchClient')
const suggestionList = document.getElementById('viewListSuggestion')
let idClient = document.getElementById('inputIdClient')
let nameClient = document.getElementById('inputNameClient')
let phoneClient = document.getElementById('inputPhoneClient')

let arrayClients = []

input.addEventListener('input', () => {
    const search = input.value.toLowerCase()
    suggestionList.innerHTML = ""

    api.searchClients()

    api.listClients((event, clients) => {
        const listaClientes = JSON.parse(clients)
        arrayClients = listaClientes

        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10)

        suggestionList.innerHTML = ""

        results.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item', 'list-group-item-action')
            item.textContent = c.nomeCliente

            item.addEventListener('click', () => {
                idClient.value = c._id
                nameClient.value = c.nomeCliente
                phoneClient.value = c.foneCliente
                input.value = ""
                suggestionList.innerHTML = ""
            })

            suggestionList.appendChild(item)
        })
    })
})

api.setSearch((args) => {
    input.focus()
})

document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionList.contains(e.target)) {
        suggestionList.innerHTML = ""
    }
})

document.addEventListener('DOMContentLoaded', () => {

    btnUpdate.disabled = true
    btnDelete.disabled = true
})

let arrayOS = []

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
let idOS = document.getElementById('inputOS')
let dateOS = document.getElementById('inputData')


function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})

function criarOS() {
    const os = {
        idClient_OS: idClient.value,
        nameClient_OS: nameClient.value,
        phoneClient_OS: phoneClient.value,
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

function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {

    const os = JSON.parse(dataOS)
    idOS.value = os._id
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
    nameClient.value = os.nomeCliente || ""
    phoneClient.value = os.telefoneCliente || ""
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

    btnCreate.disabled = true
    btnUpdate.disabled = false
    btnDelete.disabled = false
})


function atualizarOS() {
    const osEditada = {
        _id: idOS.value,
        idCliente: idClient.value,
        nomeCliente: nameClient.value,
        telefoneCliente: phoneClient.value,
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

frmOS.addEventListener('submit', (event) => {
    event.preventDefault()

    if (idClient.value === "") {
        api.validateClient()
        return
    }

    if (idOS.value === "") {
        criarOS()
    } else {
        atualizarOS()
    }
})

function removeOS() {
    api.deleteOS(idOS.value)
}

const btnPrintOS = document.getElementById('btnPrintOS')

btnPrintOS.addEventListener('click', () => {
    if (!idOS.value) {
        alert("Nenhuma OS carregada para imprimir!")
        return
    }
    imprimirOS()
})

function imprimirOS() {
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

                .termos {
                    font-size: 11px;
                    line-height: 1.6;
                    margin-top: 40px;
                    border-top: 1px dashed #aaa;
                    padding-top: 20px;
                }

                .termos h3 {
                    font-size: 14px;
                    color: #005B8F;
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <h1>Ordem de serviço - MobiTech</h1>
            <div class="section">
                <div><span class="label">Número OS:</span> ${idOS.value}</div>
                <div><span class="label">Data:</span> ${dateOS.value}</div>
                <div><span class="label">Status:</span> ${statusOS.value}</div>
            </div>

            <div class="section">
                <div><span class="label">Cliente ID:</span> ${idClient.value}</div>
                <div><span class="label">Nome do Cliente:</span> ${nameClient.value}</div>      <!-- novo -->
                <div><span class="label">Telefone do Cliente:</span> ${phoneClient.value}</div>  <!-- novo -->
            </div>

            <div class="section">
                <div><span class="label">Móvel:</span> ${furniture.value}</div>
                <div><span class="label">Modelo:</span> ${model.value}</div>
                <div><span class="label">Volumes:</span> ${volumes.value}</div>
                <div><span class="label">Ambiente:</span> ${environment.value}</div>
            </div>

            <div class="section">
                <div><span class="label">Problema:</span> ${problem.value}</div>
                <div><span class="label">Material:</span> ${material.value}</div>
                <div><span class="label">Montador:</span> ${specialist.value}</div>
                <div><span class="label">Observação:</span> ${obs.value}</div>
            </div>

            <div class="section">
                <div><span class="label">Total:</span> R$ ${total.value}</div>
            </div>

            <div style="text-align:center; margin-top: 50px;">
                <p>Assinatura do Cliente: ___________________________</p>
            </div>

            <div class="termos">
                <h3>Termo de Serviço e Garantia</h3>
                <p>O serviço de montagem descrito nesta ordem de serviço foi executado conforme as especificações fornecidas pelo cliente. É de responsabilidade do cliente a conferência prévia do local de instalação, condições do produto e presença de todas as peças e ferragens necessárias.</p>

                <p>A garantia cobre exclusivamente defeitos de montagem ou falhas atribuídas ao serviço prestado, não se estendendo a problemas decorrentes de mau uso, transporte inadequado ou montagem/desmontagem posterior sem autorização técnica.</p>

                <p>O prazo de garantia legal é de <strong>90 (noventa) dias</strong> contados a partir da conclusão do serviço, conforme o artigo 26 do Código de Defesa do Consumidor (Lei 8.078/1990).</p>

                <p>Ao assinar este documento, o cliente declara estar ciente e de acordo com os termos acima.</p>
            </div>
        </body>
        </html>
    `

    let janelaPrint = window.open('', '', 'width=800,height=600')
    janelaPrint.document.write(conteudo)
    janelaPrint.document.close()
    janelaPrint.focus()
    janelaPrint.print()
    janelaPrint.close()
}
