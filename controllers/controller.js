const express = require('express')
const router = express.Router()
const utils = require("../utils/utils")
let responseModel = require("../middlewares/response-model.json")
let { setResponse } = require("../middlewares/response_creator")
let moment = require("moment")

const middleware = require('../middlewares/middleware')

/* Criar o usuário e conta bancária */
router.post('/user/bank-account', async function (req, res) {    
    /* Criando user */
    let response = responseModel;
    let verificationResponse = await utils.checkCreationInformation(req.body.nome, req.body.cpf, req.body.datanascimento, req.body.saldo, req.body.limiteSaqueDiario)
    if(verificationResponse != true){
        verificationResponse["request"] = "create-user-and-bank-account"
        return res.status(400).send(verificationResponse)
    }
    
    try{
        let creation = await middleware.createNewUser(req.body.nome, req.body.cpf, req.body.datanascimento)
    }catch(err) {
        let responseErr = setResponse("create-user-and-bank-account", 0, 1, err, [])
        return res.status(500).send(responseErr)
    }

    /* Abrindo conta */
    let nome = '%' + req.body.nome + '%'
    let foundPerson =  await middleware.getOnePersonByName(nome)
    let idPessoa = foundPerson[0].idpessoa;

    /* Abrindo conta do banco */
    try{
        let bankAccount = await middleware.createUserBankAccount(idPessoa, req.body.saldo, req.body.limiteSaqueDiario)
    } catch(err) {
        let responseErr = setResponse("create-user-and-bank-account", 0, 1, err, [])
        return res.status(500).send(responseErr)
    }
    let foundBankAccount = ""
    try{
        foundBankAccount = await middleware.getUserBankAccount(idPessoa)
    } catch(err) {
        let responseErr = setResponse("create-user-and-bank-account", 0, 1, err, [])
        return res.status(500).send(responseErr)
    }

    /* CREATE RETURN OBJECT */
    let responseSuc = setResponse("create-user-and-bank-account", 1, 0, null, [{"user": foundPerson, "bankAccount": foundBankAccount}])
    res.send(responseSuc)
    return
})

/* Buscar conta bancária por usuário */
router.get(`/user/:filter?`, async function (req, res) {
    if(!req.params.filter){
        middleware.getAllPersons().then((data) => {
            let responseSuc = setResponse("search-all-users", data.length, 0, null, data)
            return res.status(200).send(responseSuc)
        }).catch((err) => {
            console.log(err);
            let responseErr = setResponse("search-all-users", 0, 1, err, [])
            return res.status(500).send(responseErr)
        })
        return
    } if(isNaN(parseInt(req.params.filter))){
        let nome = '%' + req.params.filter + '%'
        middleware.getOnePersonByName(nome).then((data) => {
            let responseSuc = setResponse("search-user-by-name", data.length, 0, null, data)
            return res.send(responseSuc)
        }).catch((err) => {
            console.log(err);
            let responseErr = setResponse("search-user-by-name", 0, 1, err, [])
            return res.status(500).send(responseErr)
        })
        return
    } if (!isNaN(parseInt(req.params.filter))){
        middleware.getOnePerson(req.params.filter).then((data) => {
            let responseSuc = setResponse("search-user-by-id", data.length, 0, null, data)
            return res.send(responseSuc)
        }).catch((err) => {
            console.log(err);
            let responseErr = setResponse("search-user-by-id", 0, 1, err, [])
            return res.status(500).send(responseErr)
        })
        return
    }
})

/* Buscar informações bancárias por identificador de usuário */
router.get('/user/:id/bank-account', async function (req, res) {
    let response = responseModel;
    let person = req.params.id;

    let userIdentityVerifier = await utils.checkIdentifiers(person)
    if(userIdentityVerifier != true){
        userIdentityVerifier["request"] = "search-user-bank-account"
        return res.status(400).send(userIdentityVerifier);
    }

    let verificationResponse = await utils.checkInformation(person, undefined, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        response["request"] = "search-user-bank-account"
        return res.status(500).send(response)
    }
    
    middleware.getUserBankAccount(req.params.id).then((data) => {
        let responseSuc = setResponse("search-user-bank-account", data.length, 0, null, data)
        return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("search-user-bank-account", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })
})

/* Buscar saldo bancário por identificador de usuário */
router.get('/user/:id/bank-account/:id_conta/balance/', async function (req, res) {
    let response = responseModel;

    let person = req.params.id;
    let conta = req.params.id_conta;

    
    let userIdentityVerifier = await utils.checkIdentifiers(person)
    let accountIdentityVerifier = await utils.checkIdentifiers(conta)

    if(userIdentityVerifier != true){
        userIdentityVerifier["request"] = "search-user-bank-account-balance"
        return res.status(400).send(userIdentityVerifier);
    }
    
    if(accountIdentityVerifier != true){
        userIdentityVerifier["request"] = "search-user-bank-account-balance"
        return res.status(400).send(userIdentityVerifier);
    }

    let verificationResponse = await utils.checkInformation(person, conta, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-account-balance"
        return res.status(500).send(response)
    }

    middleware.getUserBankAccount(req.params.id).then((data) => {    
    let responseSuc = setResponse("search-user-bank-account-balance", data.length, 0, null, [{"saldo": data[0].saldo}])
    return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("search-user-bank-account-balance", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })
})

/* Buscar extrato bancário pelo número de conta, relacionada ao usuário */
router.get('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Verifica integridade dos dados */
    
    let person = req.params.id;
    let conta = req.params.id_conta;
    
    let userIdentityVerifier = await utils.checkIdentifiers(person)
    let accountIdentityVerifier = await utils.checkIdentifiers(conta)

    if(userIdentityVerifier != true){
        userIdentityVerifier["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(userIdentityVerifier);
    }
    
    if(accountIdentityVerifier != true){
        accountIdentityVerifier["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(accountIdentityVerifier);
    }

    let verificationResponse = await utils.checkInformation(person, conta, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(verificationResponse)
    }

    middleware.listSinceLastMonthTransactions(conta).then((data) => {    
    let responseSuc = setResponse("search-user-bank-last-month-transactions", data.length, 0, null, data)
    return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })
    
})

/* Buscar extrato bancário filtrado por data, pelo número de conta, relacionada ao usuário */
router.post('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Define a estrutura da resposta */
    let response = responseModel;

    /* Verifica integridade dos dados */
    let person = req.params.id;
    let conta = req.params.id_conta;
    let dateInit = req.body.dataInicio;
    let dateFin = req.body.dataFinal;

    let userIdentityVerifier = await utils.checkIdentifiers(person)
    let accountIdentityVerifier = await utils.checkIdentifiers(conta)

    if(userIdentityVerifier != true){
        userIdentityVerifier["request"] = "create-user-bank-transaction"
        return res.status(400).send(userIdentityVerifier);
    }
    
    if(accountIdentityVerifier != true){
        accountIdentityVerifier["request"] = "create-user-bank-transaction"
        return res.status(400).send(accountIdentityVerifier);
    }

    let verificationResponse = await utils.checkInformation(person, conta, undefined, dateInit, dateFin, undefined)
    
    if(verificationResponse != true){
        verificationResponse["request"] = "create-user-bank-transaction"
        return res.status(400).send(verificationResponse)
    }

    if(!req.body.dataInicio){
        let responseErr = setResponse("create-user-bank-transaction", 0, 1, "No initial date for transaction informations was informed.", [])
        return res.status(400).send(responseErr)
    }
    
    if(!req.body.dataFinal){
        let responseErr = setResponse("create-user-bank-transaction", 0, 1, "No final date for transaction informations was informed.", [])
        return res.status(400).send(responseErr)
    }

    middleware.listTransactionsByTime(idConta, dateInit, dateFin).then((data) => {    
    let responseSuc = setResponse("search-user-bank-account-transactions", data.length, 0, null, data)
    return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("search-user-bank-account-transactions", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })

    
})

/* Cria uma transação */
router.post('/user/:id/bank-account/:id_conta/transaction/:type/', async function (req, res) {
    /* Verifica integridade dos dados */
       
    let person = req.params.id;
    let conta = req.params.id_conta;
    let valor = req.body.valor;
    let tipo = req.params.type;

    let userIdentityVerifier = await utils.checkIdentifiers(person)

    if(!(userIdentityVerifier === true)){
        userIdentityVerifier["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(userIdentityVerifier);
    }
    
    let accountIdentityVerifier = await utils.checkIdentifiers(conta)
    
    if(!(accountIdentityVerifier === true)){
        accountIdentityVerifier["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(accountIdentityVerifier);
    }

    let verificationResponse = await utils.checkInformation(person, conta, valor, undefined, undefined, tipo)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(verificationResponse)
    }

    if(!req.body.valor){        
        let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "No amount for this transaction was informed.", [])
        return res.status(400).send(responseErr)
    }
    
    valor = parseFloat(req.body.valor)
    tipo = parseInt(req.params.type)
    
    if(tipo > 2){
        let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "Processing type not available. Try 1 for deposit and 2 for withdraw", [])
        return res.status(400).send(responseErr)
    }

    if(tipo === 1){
        if(valor < 0){
            let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "The amount cannot be negative for deposits.", [])
            return res.status(400).send(responseErr)
        }
    }

    /* Se for saque */
    if(tipo === 2) {
        if(valor < 0){
            valor = valor * (-1);
        }

        let account_info = await middleware.getUserWithdrawInfo(conta)
        if(account_info.length > 0){
            if(account_info[0].saldo && account_info[0].limitesaquediario){
                let saldo = account_info[0].saldo
                let limite = account_info[0].limitesaquediario
                let valor_sacado = account_info[0].valor_sacado == null ? 0 : account_info[0].valor_sacado;
                
                if(valor > limite){
                    let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "The total amount exceeds the day withdraw limit amount.", [{"balance": saldo}])
                    return res.status(400).send(responseErr)
                }

                if(valor > saldo){
                    let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "This amount is over your account balance.", [{"balance": saldo}])
                    return res.status(400).send(responseErr)
                }

                if((valor_sacado + valor) > limite){
                    let responseErr = setResponse("search-user-bank-last-month-transactions", 0, 1, "This amount is over your daily account withdraw limit.", [{"balance": saldo}])
                    return res.status(400).send(responseErr)
                }
            }
        }
              
        if(valor > 0){
            valor = valor * (-1);
        }
    }
    middleware.createTransactionAccount(conta, valor).then((data) => {
    let responseSuc = setResponse("create-user-bank-account-transaction",0, 0, null, [{"status": "Successfully created"}])
    return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("create-user-bank-account-transaction", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })
})

/* Fecha ou reabre a conta de um usuário */
router.put('/user/:id/bank-account/:id_conta/toogleactivity', async function (req, res) {
    let response = responseModel;

    /* Verifica integridade dos dados */

    let person = req.params.id
    let id_conta = req.params.id_conta

    let userIdentityVerifier = await utils.checkIdentifiers(person)
    let accountIdentityVerifier = await utils.checkIdentifiers(id_conta)

    if(userIdentityVerifier != true){
        userIdentityVerifier["request"] = "change-account-status"
        return res.status(400).send(userIdentityVerifier);
    }
    
    if(accountIdentityVerifier != true){
        accountIdentityVerifier["request"] = "change-account-status"
        return res.status(400).send(accountIdentityVerifier);
    }
    
    let conta = await middleware.getUserBankAccount(req.params.id)

    let idConta = conta[0].idconta;
    let status = conta[0].flagative;

    if(conta.length = 0){
        let responseErr = setResponse("change-account-status", 0, 1, "This user does not have any bank account yet.", [])
        return res.status(400).send(responseErr)
    }

    if(idConta != req.params.id_conta){
        let responseErr = setResponse("change-account-status", 0, 1, "The informed bank account is not linked to this person.", [{"accountIdFound": idConta}])
        return res.status(400).send(responseErr)
    }
    middleware.toogleAtivityFromAccount(idConta, (!status)).then((data) => {        
    let responseSuc = setResponse("change-account-status", 1, 0, null, [{"status": `The bank account ${idConta} status was set as desactivated.`}])
    return res.send(responseSuc)
    }).catch((err) => {
        console.log(err);
        let responseErr = setResponse("change-account-status", 0, 1, err, [])
        return res.status(500).send(responseErr)
    })
})

router.allRoutes = utils.getAllRoutes(router);


module.exports = router