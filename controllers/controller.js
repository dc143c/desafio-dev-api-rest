const express = require('express')
const router = express.Router()
const utils = require("../utils/utils")
let responseModel = require("../middlewares/response-model.json")

/* Afim de diminuir a repetição de queries, foi implementado os middlewares,
sendo estes responsáveis por funções específicas */

const middleware = require('../middlewares/middleware')

router.post('/user/bank-account', async function (req, res) {    
    /* Criando user */
    let response = await utils.checkCreationInformation(req.body.nome, req.body.cpf, req.body.datanascimento, req.body.saldo, req.body.limiteSaqueDiario)
    if(response != true){
        response["request"] = "create-user-and-bank-account"
        return res.status(400).send(response)
    }
    
    try{
        let creation = await middleware.createNewUser(req.body.nome, req.body.cpf, req.body.datanascimento)
    }catch(err) {
        response["request"] = "create-user-and-bank-account"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = err;
        return res.status(500).send(response)
    }

    /* Abrindo conta */
    let nome = '%' + req.body.nome + '%'
    let foundPerson =  await middleware.getOnePersonByName(nome)
    let idPessoa = foundPerson[0].idpessoa;

    /* Abrindo conta do banco */
    try{
        let bankAccount = middleware.createUserBankAccount(idPessoa, req.body.saldo, req.body.limiteSaqueDiario)
    } catch(err) {
        response["request"] = "create-user-and-bank-account"
        response["row-count"] = 0;
        response["results"] = [];
        response["error"]["status"] = true;
        response["error"]["message"] = err;
        return res.status(500).send(response)
    }
    let foundBankAccount = ""
    try{
        foundBankAccount = middleware.getUserBankAccount(idPessoa)
    } catch(err) {
        response["request"] = "create-user-and-bank-account"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = err;
        return res.status(500).send(response)
    }

    /* CREATE RETURN OBJECT */
    response['request'] = "create-user-and-bank-account"
    response['row-count'] = 1
    response.results.push({"user": foundPerson, "bankAccount": foundBankAccount})
    res.send(response)
    return
})

router.get(`/user/:filter?`, async function (req, res) {
    if(!req.params.filter){
        let response = responseModel;
        middleware.getAllPersons().then((data) => {
            response["request"] = "search-all-users"
            response["row-count"] = data.length;
            response["results"] = data;
            res.send(response)
        }).catch((err) => {
            response["request"] = "search-all-users"
            response["row-count"] = 0
            response["error"]["status"] = true;
            response["error"]["message"] = err;
            response["results"] = [];
            res.send(response)
        })
        return
    } if(isNaN(parseInt(req.params.filter))){
        let response = responseModel;
        let nome = '%' + req.params.filter + '%'
        middleware.getOnePersonByName(nome).then((data) => {
            response["request"] = "search-user-by-name"
            response["row-count"] = data.length;
            response["results"] = data;
            res.send(response)
        }).catch((err) => {
            response["request"] = "search-user-by-name"
            response["row-count"] = 0
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = err;
            res.send(response)
        })
        return
    } if (!isNaN(parseInt(req.params.filter))){
        let response = responseModel;
        middleware.getOnePerson(req.params.filter).then((data) => {
            response["request"] = "search-user-by-identifier"
            response["row-count"] = data.length;
            response["results"] = data;
            res.send(response)
        }).catch((err) => {
            response["request"] = "search-user-by-identifier"
            response["row-count"] = 0
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = err;
            res.send(response)
        })
        return
    }
})

router.get('/user/:id/bank-account', async function (req, res) {
    let person = req.params.id;

    let verificationResponse = await utils.checkInformation(person, undefined, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        response["request"] = "search-user-bank-account"
        res.status(500).send(response)
    }
    
    let response = responseModel;
    middleware.getUserBankAccount(req.params.id).then((data) => {
        response["request"] = "search-user-bank-account"
        response["row-count"] = data.length;
        response["results"] = data;
        res.status(200).send(response)
    }).catch((err) => {
        res.send(err)
    })
    return
})

router.get('/user/:id/bank-account/:id_conta/balance/', async function (req, res) {
    let response = responseModel;

    let person = req.params.id;
    let conta = req.params.id_conta;

    let verificationResponse = await utils.checkInformation(person, conta, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-account-balance"
        res.status(500).send(response)
    }

    middleware.getUserBankAccount(req.params.id).then((data) => {
        response["request"] = "search-user-bank-account-balance"
        response["row-count"] = data.length;
        response["results"] = {"saldo": data[0].saldo};
        res.status(200).send(response)
    }).catch((err) => {
        res.send(err)
    })
    return
})

router.get('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Verifica integridade dos dados */
    
    let person = req.params.id;
    let conta = req.params.id_conta;

    let verificationResponse = await utils.checkInformation(person, conta, undefined, undefined, undefined, undefined)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-last-month-transactions"
        res.status(400).send(verificationResponse)
    }

    let response = responseModel;
    middleware.listSinceLastMonthTransactions(idConta).then((data) => {
        response["request"] = "search-user-bank-last-month-transactions"
        response["row-count"] = data.length;
        response["results"] = data;
        res.status(200).send(response)
    }).catch((err) => {
        res.send(err)
        response["request"] = "search-user-bank-last-month-transactions"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["error"]["message"] = "Something happened on our internal service.";
        response["results"] = err;
        res.status(500).send(response)
    })

    return
})

router.post('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Define a estrutura da resposta */
    let response = responseModel;

    /* Verifica integridade dos dados */
    let person = req.params.id;
    let conta = req.params.id_conta;
    let dateInit = req.body.dataInicio;
    let dateFin = req.body.dataFinal;
    
    let verificationResponse = await utils.checkInformation(person, conta, undefined, dateInit, dateFin, undefined)
    
    if(verificationResponse != true){
        verificationResponse["request"] = "create-user-bank-transaction"
        return res.status(400).send(verificationResponse)
    }

    if(!req.body.dataInicio){
        response["request"] = "create-user-bank-transaction"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = "No initial date for transaction informations was informed.";
        return res.status(400).send(response)
    }
    
    if(!req.body.dataFinal){
        response["request"] = "create-user-bank-transaction"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = "No final date for transaction informations  was informed.";
        return res.status(400).send(response)
    }

    middleware.listTransactionsByTime(idConta, req.body.dataInicio, req.body.dataFinal).then((data) => {
        response["request"] = "search-user-bank-account-transactions"
        response["row-count"] = data.length;
        response["results"] = data;
        res.status(200).send(response)
    }).catch((err) => {
        response["request"] = "search-user-bank-account-transactions"
        response["row-count"] = 0;
        response["results"] = err;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = "Something may happened at our internal server.";
        res.status(500).send(err)
    })

    return
})

router.post('/user/:id/bank-account/:id_conta/transaction/:type/', async function (req, res) {
    /* Verifica integridade dos dados */
       
    let person = req.params.id;
    let conta = req.params.id_conta;
    let valor = req.body.valor;
    let tipo = req.params.type;

    let verificationResponse = await utils.checkInformation(person, conta, valor, undefined, undefined, tipo)
    if(verificationResponse != true){
        verificationResponse["request"] = "search-user-bank-last-month-transactions"
        return res.status(400).send(verificationResponse)
    }

    if(!req.body.valor){
        response["request"] = "search-user-bank-last-month-transactions"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = "No amount for this transaction was informed.";
        return res.status(400).send(response)
    }
    
    valor = parseFloat(req.body.valor)

    /* Se for saque */
    if(req.params.type = "2") {
        if(valor > 0){
            valor = valor * (-1);
        }
    }

    let response = responseModel;
    middleware.createTransactionAccount(idConta, valor).then((data) => {
        response["request"] = "create-user-bank-account-transaction"
        response["row-count"] = data.length;
        response["results"] = data;
        res.status(201).send(response)
    }).catch((err) => {
        response["request"] = "create-user-bank-account-transaction"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"]  = err;
        return res.status(400).send(response)
    })
    return
})

router.post('/user/:id/bank-account/:id_conta/toogleactivity', async function (req, res) {
    /* Verifica integridade dos dados */
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    
    let conta = await middleware.getUserBankAccount(req.params.id)

    let idConta = conta[0].idconta;
    let status = conta[0].flagative;

    if(conta.length = 0){
        response["request"] = "change-account-status"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = [];
        response["error"]["message"] = "This user does not have any bank account yet.";
        return res.status(400).send(response)
    }

    if(idConta != req.params.id_conta){
        response["request"] = "change-account-status"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["results"] = {"accountIdFound": idConta};
        response["error"]["message"] = "The informed bank account is not linked to this person.";
        return res.status(400).send(response)
    }
    let response = responseModel;
    middleware.toogleAtivityFromAccount(idConta, (!status)).then((data) => {
        response["request"] = "change-account-status"
        response["row-count"] = data.length;
        response["results"] = `The bank account ${idConta} status was set as desactivated.`;
        res.status(200).send(response)
    }).catch((err) => {
        response["request"] = "change-account-status"
        response["row-count"] = 0;
        response["error"]["status"] = true;
        response["error"]["message"] = err
        return res.status(400).send(response)
    })

    return
})

router.allRoutes = utils.getAllRoutes(router);


module.exports = router

/*
toogleAtivityFromAccount
Utilizado do script para criar a tb_pessoa:

create table tb_pessoa (
idPessoa int generated always as identity,
nome varchar(50) not null,
cpf varchar(14) not null,
dataNascimento date default now()
)

Utilizado do script para criar a tb_transac:

create table tb_transac (
idTransacao int generated always as identity,
idConta int not null,
valor money not null,
dataTransacao date default now()
)

Utilizado do script para criar a tb_contas:

create table tb_conta (
	idConta int generated always as identity,
	idPessoa int not null,
	saldo money default 0,
	limiteSaqueDiario money default 100,
	flagAtivo boolean default true,
	tipoConta int default 1,
	dataCriacao date default now()
)
*/