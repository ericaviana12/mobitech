function obterData(){
    let dataAtual = new Date()

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return dataAtual.toLocaleDateString('pt-BR', options)
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('dataAtual').innerHTML = obterData()
})