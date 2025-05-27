const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const mongoose = require('mongoose')
const path = require('node:path')
const { conectar, desconectar } = require("./database.js")
const clientModel = require("./src/models/Clientes.js")
const osModel = require('./src/models/Os.js')
const { jspdf, default: jsPDF } = require('jspdf')
const fs = require('fs')
const prompt = require('electron-prompt')

let win
const createWindow = () => {
    nativeTheme.themeSource = 'dark'
    win = new BrowserWindow({
        width: 1010,
        height: 720,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')

    ipcMain.on('client-window', () => {
        clienteWindow()
    })

    ipcMain.on('os-window', () => {
        osWindow()
    })

}

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
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center()
}

let osScreen
function osWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        osScreen = new BrowserWindow({
            width: 1010,
            height: 650,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    osScreen.loadFile('./src/views/os.html')
    osScreen.center()
}

let about
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        about = new BrowserWindow({
            width: 800,
            height: 550,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }

    about.loadFile('./src/views/sobre.html')
}

app.whenReady().then(() => {
    createWindow()

    ipcMain.on('db-connect', async (event) => {
        await conectar()
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500)
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', async () => {
    await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')

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
                label: 'OS abertas',
                click: () => relatorioOSporStatus('Aberta', 'Abertas', 'os_abertas')
            },
            {
                label: 'OS em andamento',
                click: () => relatorioOSporStatus('Em andamento', 'Em Andamento', 'os_em_andamento')
            },
            {
                label: 'OS aguardando material',
                click: () => relatorioOSporStatus('Aguardando material', 'Aguardando Material', 'os_aguardando_material')
            },
            {
                label: 'OS concluídas',
                click: () => relatorioOSporStatus('Concluída', 'Concluídas', 'os_concluidas')
            },
            {
                label: 'OS canceladas',
                click: () => relatorioOSporStatus('Cancelada', 'Canceladas', 'os_canceladas')
            },
            {
                label: 'Todas as OS',
                click: () => relatorioTodasOS()
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
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

async function relatorioClientes() {
    try {
        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        const doc = new jsPDF('p', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(26)
        doc.text("Relatório de clientes", 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)

        let y = 60
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("Email", 130, y)
        y += 5

        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)

        y += 10
        clientes.forEach((c) => {
            if (y > 280) {
                doc.addPage()
                y = 20
                doc.text("Nome", 14, y)
                doc.text("Telefone", 80, y)
                doc.text("Email", 130, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y)
                y += 10
            }

            doc.text(String(c.nomeCliente || ''), 14, y)
            doc.text(String(c.foneCliente || ''), 80, y)
            doc.text(String(c.emailCliente || ''), 130, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Páginas ${i} de ${paginas}`, 105, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')

        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}

ipcMain.on('search-suggestions', async (event, termo) => {
    try {
        const regex = new RegExp(termo, 'i')
        let sugestoes = await clientModel.find({
            $or: [
                { nomeCliente: regex },
                { cpfCliente: regex }
            ]
        }).limit(10)

        sugestoes = sugestoes.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente))

        event.reply('suggestions-found', JSON.stringify(sugestoes))
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error)
    }
})


ipcMain.on('new-client', async (event, client) => {
    try {
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
        await newClient.save()

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })

    } catch (error) {
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "ATENÇÃO!",
                message: "CPF já cadastrado. \n Verfique o número digitado.",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('reset-cpf')
                }
            })
        } else {
            console.log(error)
        }
    }

})

ipcMain.on('search-name', async (event, cliValor) => {

    try {
        const valor = cliValor.trim()
        const cpfRegex = /^\d{11}$/

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
            })
        } else {
            event.reply('render-client', JSON.stringify(client))
        }
    } catch (error) {
        console.error("Erro ao buscar cliente:", error)
    }
})

ipcMain.on('update-clientes', async (event, dadosAtualizados) => {
    try {
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

        await cliente.save()

        dialog.showMessageBox({
            type: 'info',
            title: 'Sucesso',
            message: 'Cliente atualizado com sucesso!',
            buttons: ['OK']
        })

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

ipcMain.on('delete-client', async (event, cpf) => {
    try {
        const resultado = await clientModel.deleteOne({ cpfCliente: cpf })
        if (resultado.deletedCount > 0) {
            dialog.showMessageBox({
                type: 'info',
                title: 'Exclusão concluída',
                message: 'Cliente excluído com sucesso!'
            })
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


ipcMain.on('search-clients', async (event) => {
    try {
        const clients = await clientModel.find().sort({ nomeCliente: 1 })
        event.reply('list-clients', JSON.stringify(clients))
    } catch (error) {
        console.log(error)
    }
})


ipcMain.on('validate-client', (event) => {
    dialog.showMessageBox({
        type: 'warning',
        title: "Aviso!",
        message: "É obrigatório vincular o cliente na ordem de serviço",
        buttons: ['OK']
    }).then((result) => {
        if (result.response === 0) {
            event.reply('set-search')
        }
    })
})

ipcMain.on('new-os', async (event, os) => {

    try {
        const newOS = new osModel({
            idCliente: os.idClient_OS,
            statusOS: os.stat_OS,
            movel: os.furniture_OS,
            modelo: os.model_OS,
            volumes: os.volumes_OS,
            ambiente: os.environment_OS,
            problema: os.problem_OS,
            material: os.material_OS,
            montador: os.specialist_OS,
            observacao: os.obs_OS,
            valor: os.total_OS
        })
        await newOS.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "OS gerada com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

ipcMain.on('search-os', async (event) => {
    prompt({
        title: 'Buscar OS',
        label: 'Digite o número da OS:',
        inputAttrs: {
            type: 'text'
        },
        type: 'input',
        width: 400,
        height: 200
    }).then(async (result) => {
        if (result !== null) {
            if (mongoose.Types.ObjectId.isValid(result)) {
                try {
                    const dataOS = await osModel.findById(result)
                    if (dataOS) {
                        event.reply('render-os', JSON.stringify(dataOS))
                    } else {
                        dialog.showMessageBox({
                            type: 'warning',
                            title: "Aviso!",
                            message: "OS não encontrada",
                            buttons: ['OK']
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                dialog.showMessageBox({
                    type: 'error',
                    title: "Atenção!",
                    message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
                    buttons: ['OK']
                })
            }
        }
    })
})

ipcMain.on('update-os', async (event, os) => {
    try {
        const atualizada = await osModel.findByIdAndUpdate(
            os._id,
            {
                idCliente: os.idCliente,
                statusOS: os.statusOS,
                movel: os.movel,
                modelo: os.modelo,
                volumes: os.volumes,
                ambiente: os.ambiente,
                problema: os.problema,
                material: os.material,
                montador: os.montador,
                observacao: os.observacao,
                valor: os.valor
            },
            { new: true }
        )

        dialog.showMessageBox({
            type: 'info',
            title: 'Aviso',
            message: 'OS atualizada com sucesso!',
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        console.log(error)
        dialog.showErrorBox('Erro ao atualizar OS', error.message)
    }
})

ipcMain.on('delete-os', async (event, idOS) => {

    try {
        const { response } = await dialog.showMessageBox(osScreen, {
            type: 'warning',
            title: "Atenção!",
            message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
            buttons: ['Cancelar', 'Excluir']
        })
        if (response === 1) {
            const delOS = await osModel.findByIdAndDelete(idOS)
            event.reply('reset-form')
        }
    } catch (error) {
        console.log(error)
    }
})

async function relatorioOSporStatus(statusDesejado, tituloRelatorio, nomeArquivo) {
    try {
        const osFiltradas = await osModel.find({ statusOS: statusDesejado }).sort({ dataEntrada: -1 })

        const doc = new jsPDF('p', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(26)
        doc.text(`Relatório de OS - ${tituloRelatorio}`, 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)

        let y = 60
        doc.setFontSize(12)

        doc.text("Nº OS", 14, y)
        doc.text("Móvel", 70, y)
        doc.text("Problema", 120, y)
        doc.text("Valor", 170, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10

        const formatarValor = (valorStr) => {
            const numero = Number(valorStr.replace(/\./g, '').replace(',', '.')) || 0
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
        }

        osFiltradas.forEach((o) => {
            if (y > 280) {
                doc.addPage()
                y = 20
                doc.text("Nº OS", 14, y)
                doc.text("Móvel", 70, y)
                doc.text("Problema", 120, y)
                doc.text("Valor", 170, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y)
                y += 10
            }

            doc.text(String(o._id || ''), 14, y)
            doc.text(String(o.movel || ''), 70, y)
            doc.text(String(o.problema || ''), 120, y)
            doc.text(formatarValor(o.valor || '0'), 170, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 105, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, `${nomeArquivo}.pdf`)
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}


async function relatorioTodasOS() {
    try {
        const osList = await osModel.find().sort({ dataEntrada: -1 })

        const doc = new jsPDF('l', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(22)
        doc.text(`Relatório Geral de Ordens de Serviço`, 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 240, 10)

        let y = 60
        doc.setFontSize(11)

        doc.text("Nº OS", 10, y)
        doc.text("Móvel", 70, y)
        doc.text("Problema", 130, y)
        doc.text("Status", 230, y)
        doc.text("Valor", 270, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 285, y)
        y += 10

        const formatarValor = (valorStr) => {
            const numero = Number(valorStr.replace(/\./g, '').replace(',', '.')) || 0
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
        }

        osList.forEach((o) => {
            if (y > 190) {
                doc.addPage()
                y = 20
                doc.text("Nº OS", 10, y)
                doc.text("Móvel", 70, y)
                doc.text("Problema", 130, y)
                doc.text("Status", 230, y)
                doc.text("Valor", 270, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 285, y)
                y += 10
            }

            doc.text(String(o._id || ''), 10, y)
            doc.text(String(o.movel || ''), 70, y)
            doc.text(String(o.problema || ''), 130, y)
            doc.text(String(o.statusOS || ''), 230, y)
            doc.text(formatarValor(o.valor || '0'), 270, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 150, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, `os_todas.pdf`)
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}
