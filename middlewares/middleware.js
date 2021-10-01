const pgsql = require("../connection/queries")
const utils = require("../utils/utils")

const middleware = {}

/* USER */
middleware.createNewUser = async (nome, cpf, datanascimento) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.createNewUser(nome, cpf, datanascimento).then((res) => {
                resolve(res.rows)
            })
        } catch (err) {
            reject(err)
        }
    })
}

middleware.getOnePersonByName = async (nome) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getOnePersonByName(nome).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.getAllPersons = async () => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getAllPersons().then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.getOnePerson = async (id) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getOnePerson(id).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

/* CONTA BANCÁRIA */

middleware.createUserBankAccount = async (idPessoa, saldo, limiteSaqueDiario) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.createUserBankAccount(idPessoa, saldo, limiteSaqueDiario).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.getUserBankAccount = async (idPessoa) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getUserBankAccount(idPessoa).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}


middleware.getUserBankAccount = async (idPessoa) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getUserBankAccount(idPessoa).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.listSinceLastMonthTransactions = async (id) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.getUserBankAccount(id).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.listTransactionsByTime = async (id, dI, dF) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.listTransactionsByTime(id, dI, dF).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.createTransactionAccount = async (id, valor) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.createTransactionAccount(id, valor).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}

middleware.toogleAtivityFromAccount = async (id) => {
    return new Promise((resolve, reject) => {
        try{
            pgsql.toogleAtivityFromAccount(id).then((res) => {
                resolve(res.rows)
            })
        } catch(err){
            console.log(err)
            reject(err)
        }
    })
}
module.exports = middleware;