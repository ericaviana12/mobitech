/**
 * Modelo de dados para construção das coleções("tabelas")
 * OS
 */

// importação dos recursos do framework mongoose
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção OS
const osSchema = new Schema({
    dataEntrada: {
        type: Date,
        default: Date.now
    },
    idCliente: {
        type: String,        
    },
    statusOS: {
        type: String
    },
    movel: {
        type: String
    },
    marca: {
        type: String        
    },
    volumes: {
        type: String  
    },
    ambiente: {
        type: String
    },
    problemas: {
        type: String  
    },
    material: {
        type: String  
    },
    montador: {
        type: String 
    },
    observacoes: {
        type: String 
    },
    valor: {
        type: String 
    },
}, {versionKey: false}) //não versionar os dados armazenados

// exportar para o main o modelo de dados
// OBS: OS 
module.exports = model('Os', osSchema)