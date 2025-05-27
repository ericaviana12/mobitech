const mongoose = require('mongoose')

const url = 'mongodb+srv://admin:123Senac@ericaviana12.ozwku.mongodb.net/dbmobitech'

let conectado = false

const conectar = async () => {
    if (!conectado) {

        try {
            await mongoose.connect(url)
            conectado = true
            console.log("MongoDB conectado")

            return true
        } catch (error) {
            console.log(error)
            if (error.code = 8000) {
                console.log("Erro de autenticação")
            } else {
                console.log(error)
            }
        }
    }
}

const desconectar = async () => {
    if (conectado) {

        try {
            await mongoose.disconnect(url)
            conectado = false
            console.log("MongoDB desconectado")

            return true
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = { conectar, desconectar }