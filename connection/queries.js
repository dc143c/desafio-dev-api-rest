const { Client } = require('pg')
const moment = require('moment')

const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

let queries = {
connect: function() {
    return new Promise((resolve, reject) => {
        try{
            client.connect(function(err) {
                if (err) {
                    reject({"status": 500, "message": "Couldn't get connection from database, trying again..."});
                } else {
                    resolve({"status": 201, "message": "Connected with the database!"});
                }
            })
        } catch(err) {
            reject({"status": 500, "message": "Couldn't get connection from database"});
        }
    })
},

getAllPersons: async function() {
    return client.query("select * from tb_pessoa")
},
getOnePerson: async function(id) {
    return client.query(`select * from tb_pessoa where idpessoa = ${id}`)
},
getOnePersonByName: async function(name) {
    let queryText = `select * from tb_pessoa where nome like '${name}'`
    return client.query(queryText)
},
createNewUser: async function(name, document, btdate) {
    let queryText = `insert into tb_pessoa(nome, cpf, dataNascimento) values('${name}', '${document}', cast('${btdate}' as date))`
    return client.query(queryText)
},
createUserBankAccount: async function(idPessoa, saldo, limiteSaqueDiario) {
    let queryText = `insert into tb_conta(idPessoa, saldo, limiteSaqueDiario) values(cast('${idPessoa}' as int), cast('${saldo}' as money), cast('${limiteSaqueDiario}' as money))`
    return client.query(queryText)
},
getUserBankAccount: async function(idPessoa) {
    let queryText = `select * from tb_conta where idPessoa = ${idPessoa}`
    return client.query(queryText)
},
createTransactionAccount: async function(idConta, Valor) {
    let queryText = `insert into tb_transac(idConta, valor) values(cast('${idConta}' as int), cast('${Valor}' as money)); 
    update tb_conta set saldo = saldo + cast('${Valor}' as money) where idconta = ${idConta}`
    return client.query(queryText)
},
listTransactionsByTime: async function(idConta, dataIni, dataFim) {
    let queryText = `select * from tb_transac where idconta = ${idConta} and datatransacao between cast('${dataIni}' as date) and cast('${dataFim}' as date)`
    return client.query(queryText)
},
toogleAtivityFromAccount: async function(idConta, status) {
    let queryText = `update tb_conta set flagativo = ${status} where idconta = ${idConta}`
    return client.query(queryText)
},
listSinceLastMonthTransactions: async function(idConta) {
    let data_inicio = moment().add(1, "day").format("MM/DD/YYYY")
    let data_fim = moment().subtract(1, "month").format("MM/DD/YYYY")
    let queryText = `select * from tb_transac where idconta = ${idConta} and datatransacao <= cast('${data_inicio}' as date) and datatransacao >= cast('${data_fim}' as date);`
    return client.query(queryText)
},
getWidthdrawInfo: async function (idConta){
    let dateFin = moment().add(1, "day").format("MM/DD/YYYY")
    let dateInit = moment().subtract(2, "day").format("MM/DD/YYYY")
    let queryText = `
    select  * from
    (
        select
            cast(sum(valor * -1) as numeric) valor_sacado,
            idconta
        from tb_transac
        where
            idconta = ${idConta}
            and valor < cast(0 as money)
            and datatransacao <= cast('${dateFin}' as date)
            and datatransacao >= cast('${dateInit}' as date)
        group by
            idconta
    ) a
    right join 
    (
        select
            cast(saldo as numeric) as saldo,
            cast(limitesaquediario as numeric) as limitesaquediario,
            idconta
        from
            tb_conta
        where
            idconta = ${idConta}
        group by
            saldo,
            limitesaquediario,
            idconta
    ) b
    on
        a.idconta = b.idconta
    `
    return client.query(queryText)
},
}

module.exports = queries;