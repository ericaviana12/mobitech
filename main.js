console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

//shell serve para importar pdf

//Esta linha está relacionado ao preload.js
const path = require('node:path')

//Importação dos métodos conectar o e desconecatr (do modulo de conexão)
const { conectar, desconectar } = require("./database.js")

//Importação do schema cliente conectar e desconectar (módulo de conexão)
const clientModel = require("./src/models/Clientes.js")

//Importação do pacote jspdf (npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

//importação de biblioteca fs (nativa do js) para manipulação de dados
const fs = require('fs')

//Janela principal
let win
const createWindow = () => {
    //A linha abaixo define o tema (claro ou escuro)
    nativeTheme.themeSource = 'dark' //Duas opções para deixar a tela (escuro(dark) / claro(light))
    win = new BrowserWindow({
        width: 1010,
        height: 720,
        // autoHideMenuBar: true,
        resizable: false,

        //Ativação do preload.js
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    //Menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')

    //Recebimento dos pedidos do renderizador para abertura da janelas (botões), autorizados no preload.js
    ipcMain.on('client-window', () => {
        clienteWindow()
    })

    ipcMain.on('os-window', () => {
        osWindow()
    })

}

// Janela clientes
let client

function clienteWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 650,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            //Ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center()//centralizar a tela
}

//Janela os
let os

function osWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        os = new BrowserWindow({
            width: 1010,
            height: 650,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true
        })
    }
    os.loadFile('./src/views/OS.html')
    os.center()
}

// Janela sobre
let about
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    // obter a janela principal
    const main = BrowserWindow.getFocusedWindow()
    // validação (se existir a janela principal)
    if (main) {
        about = new BrowserWindow({
            width: 800,
            height: 550,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            // estabelecer uma relação hierárquica entre janelas
            parent: main,
            // criar uma janela modal (só retorna a principal quando encerrada)
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    //Carreegar o documento HTML na janela
    about.loadFile('./src/views/sobre.html')
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
    createWindow()

    // Melhor local para estebelecer a conexão com o banco de dados
    // No MongoDb é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e fechar a conexão e encerrar quando o aplicativo for finalizado
    // ipcMain.on (receber mensagem)
    // db-connect (rótulo da mensagem)
    ipcMain.on('db-connect', async (event) => {
        // A linha abaixo estabelece a conexão com o banco de dados
        await conectar()
        // Enviar ao rendereizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5s ou 1s para sincronização com a nuvem)
        setTimeout(() => {
            // Enviar ao renderizador a mensagem "conectado"
            // db-status (IPC - comunicação entre processos - autorizada pelo preload.js)
            event.reply('db-status', "conectado")
        }, 500) // 500ms = 0.5s
    })

    // Só ativar a janela principal se nenhuma outra estiver ativa
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Se o sistema não for MAC, encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
    await desconectar()
})

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

//Template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clienteWindow()
            },
            {
                label: 'OS',
                click: () => osWindow()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Relatório',
        submenu: [
            {
                label: 'Clientes',
                click: () => relatorioClientes()
            },
            {
                label: 'OS aberta'
            },
            {
                label: 'OS concluídas'
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir zoom',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar zoom padrão',
                role: 'resetZoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramenta do desenvolvedor',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Repositório',
                click: () => shell.openExternal('https://github.com/ericaviana12/mobitech')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]


//============================================================
//Relátorio de clientes ======================================
async function relatorioClientes() {
    try {
        // passo 1: consultar o banco de dados e obter a listagem de clientes cadastrados por ordem alfabética
        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        //teste de recebimento da listagem de clientes
        console.log(clientes)

        //Passo 2: formatação do documento
        //p - portrait | 1 - landscape | mm e a4 (folha a4 (210x279m))
        const doc = new jsPDF('p', 'mm', 'a4')

        //Inserir imagens no documento PDF
        // imagePath (caminho da imagem que será inserida no PDF)
        // imageBase64 (Uso da biblioteca fs para ler o arquivo no formato png)
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8) //5mm, 8mm

        //definir o tamanho da fonte
        doc.setFontSize(26)
        //Escrevendo um texto (título)
        doc.text("Relatório de clientes", 14, 45)//x, y (mm)

        //Inserir a data atual no relatório
        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)
        //Variável de apoio na formação
        let y = 60
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("Email", 130, y)
        y += 5
        // Desenhar a linha
        doc.setLineWidth(0.5)// espessura da linha
        doc.line(10, y, 200, y) // 10 (Inicio) e 200 (fim)

        //Renderizar os clientes cadastro no banco
        y += 10 //Espaçamento da linha
        //Percorrer o vetor clientes(obtido no banco) usando o laço forEach (equivale a laço for)
        clientes.forEach((c) => {
            //Adicionar outra página se a folha inteira for preenchida (estratágeia da folha)
            // folha a4 y = 270m
            if (y > 280) {
                doc.addPage()
                y = 20 //Resetar a variável y
                //redesenhar o cabeçalho
                doc.text("Nome", 14, y)
                doc.text("Telefone", 80, y)
                doc.text("Email", 130, y)
                y += 5
                doc.setLineWidth(0.5)// espessura da linha
                doc.line(10, y, 200, y)
                y += 10
            }


            doc.text(String(c.nomeCliente || ''), 14, y)
            doc.text(String(c.foneCliente || ''), 80, y)
            doc.text(String(c.emailCliente || ''), 130, y)
            y += 10
        })

        //Adicionar numeração automática de páginas
        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Páginas ${i} de ${paginas}`, 105, 200, { align: 'center' })
        }

        //Definir o caminho do arquivo temporário
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')

        //Salvar temporariamente o arquivo
        doc.save(filePath)
        //Abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuario
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}

//= Fim - Relatório de clientes ==============================
//============================================================


// ===========================================================
//Clientes - CRUD CREATE

// Recebimento do objeto que contem os dados do cliente 
ipcMain.on('new-client', async (event, client) => {
    //Importante! Teste de recebimento dos dados do cliente
    console.log(client)
    // Cadastrar a  estrtura de dados no banco de dados no mongodb
    try {
        //Criar uma nova estrutura de dados usando a classe modelo
        //Atenção! OS atributos precisam ser identicos ao modelo de dados clientes.js
        //e os valores são definidos pelo conteúdo ao objeto client
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            emailCliente: client.emailCli,
            foneCliente: client.foneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.logCli,
            numeroCliente: client.numCli,
            complementoCliente: client.complementoCli,
            bairroCliente: client.bairroCli,
            cidadeCliente: client.cidadeCli,
            ufCliente: client.ufCli
        })
        //Salvar os dados dos clientes no banco de dados
        await newClient.save()

        // Confirmação de cliente adicionado ao banco (uso do dialog)
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            // se o botão OK for pressionando
            if (result.response === 0) {
                //enviar um pedido para o renderizador limpar os campos (preload.js)
                event.reply('reset-form')
            }
        })

    } catch (error) {
        // Tratamento da exceção de CPF duplicado
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "ATENÇÃO!",
                message: "CPF já cadastrado. \n Verfique o número digitado.",
                buttons: ['OK']
            }).then((result) => {
                // Se o botão OK for pressionado
                if (result.response === 0) {
                    event.reply('reset-cpf')
                }
            })
        } else {
            console.log(error)
        }
    }

})

//Fim - Clientes - CRUD CREATE==============================


//=============================================================
//Crud Read ===================================================

ipcMain.on('search-name', async (event, cliValor) => {
    console.log("Valor de busca recebido:", cliValor)

    try {
        const valor = cliValor.trim()
        const cpfRegex = /^\d{11}$/ // verifica se é CPF

        // Se for CPF, busca pelo campo 'cpf'; senão, pelo campo 'nome'
        const query = cpfRegex.test(valor.replace(/\D/g, ''))
            ? { cpfCliente: new RegExp(valor, 'i') }
            : { nomeCliente: new RegExp(valor, 'i') }

        const client = await clientModel.find(query)

        if (client.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Cliente não cadastrado. \nDeseja cadastrar este cliente?',
                defaultId: 0,
                buttons: ['Sim', 'Não']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-name')
                } else {
                    event.reply('reset-form')
                }
            });
        } else {
            event.reply('render-client', JSON.stringify(client))
        }
    } catch (error) {
        console.error("Erro ao buscar cliente:", error)
    }
})

//Fim Crud Read ======================================================


// ==========================================================================
//CRUD UPDATE ====================================================================

// Atualizar cliente no banco
ipcMain.on('update-clientes', async (event, dadosAtualizados) => {
    try {
        // Procurar o cliente pelo CPF (ou algum outro identificador único)
        const cliente = await clientModel.findOne({ cpfCliente: dadosAtualizados.cpf })
        if (!cliente) {
            dialog.showMessageBox({
                type: 'error',
                title: 'Erro',
                message: 'O CPF não pode ser alterado! Para corrigir esse dado, exclua o cliente e cadastre novamente.',
                buttons: ['OK']
            })
            return
        }

        // Atualizar os dados do cliente
        cliente.nomeCliente = dadosAtualizados.nome
        cliente.cpfCliente = dadosAtualizados.cpf
        cliente.emailCliente = dadosAtualizados.email
        cliente.foneCliente = dadosAtualizados.telefone
        cliente.cepCliente = dadosAtualizados.cep
        cliente.logradouroCliente = dadosAtualizados.logradouro
        cliente.numeroCliente = dadosAtualizados.numero
        cliente.complementoCliente = dadosAtualizados.complemento
        cliente.bairroCliente = dadosAtualizados.bairro
        cliente.cidadeCliente = dadosAtualizados.cidade
        cliente.ufCliente = dadosAtualizados.uf


        // Salvar no banco de dados
        await cliente.save()

        // Confirmação de sucesso
        dialog.showMessageBox({
            type: 'info',
            title: 'Sucesso',
            message: 'Cliente atualizado com sucesso!',
            buttons: ['OK']
        })

        // Enviar uma mensagem para o renderer para resetar o formulário
        event.reply('reset-form')

    } catch (error) {
        console.log(error)
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: 'Ocorreu um erro ao atualizar o cliente.',
            buttons: ['OK']
        })
    }
})

//FIM CRUD UPDATE ====================================================================
// ==========================================================================


//===========================================================================
//= CRUD Delete =============================================================

ipcMain.on('delete-client', async (event, cpf) => {
    try {
        const resultado = await clientModel.deleteOne({ cpfCliente: cpf })
        if (resultado.deletedCount > 0) {
            dialog.showMessageBox({
                type: 'info',
                title: 'Exclusão concluída',
                message: 'Cliente excluído com sucesso!'
            })
            // Limpar formulário após exclusão
            event.reply('reset-form')
        } else {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Erro',
                message: 'Cliente não encontrado para exclusão.'
            })
        }
    } catch (erro) {
        console.log(erro)
        dialog.showErrorBox('Erro ao excluir cliente', erro.message)
    }
})

//= Fim - CRUD Delete =======================================================
//===========================================================================


// ==========================================================================
// === Lista suspensa =======================================================

ipcMain.on('search-suggestions', async (event, termo) => {
    try {
        const regex = new RegExp(termo, 'i')
        let sugestoes = await clientModel.find({
            $or: [
                { nomeCliente: regex },
                { cpfCliente: regex }
            ]
        }).limit(10)

        // Ordena em ordem alfabética pelo nomeCliente
        sugestoes = sugestoes.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente))

        event.reply('suggestions-found', JSON.stringify(sugestoes))
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error)
    }
})

// === Fim -  Lista suspensa ================================================
// ==========================================================================
