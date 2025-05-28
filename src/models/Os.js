const { model, Schema } = require('mongoose')

const osSchema = new Schema({
    dataEntrada: {
        type: Date,
        default: Date.now
    },
    idCliente: {
        type: String,        
    },
    nomeCliente: {
        type: String
    },
    telefoneCliente: {
        type: String
    },
    statusOS: {
        type: String
    },
    movel: {
        type: String
    },
    modelo: {
        type: String        
    },
    volumes: {
        type: String  
    },
    ambiente: {
        type: String 
    },
    problema: {
        type: String  
    },
    material: {
        type: String 
    },
    montador: {
        type: String  
    },
    observacao: {
        type: String
    },
    valor: {
        type: String 
    },
}, {versionKey: false})

module.exports = model('OS', osSchema)