const express = require('express')
const router = express.Router()
const pgsql = require("../connection/queries")
const utils = require("../utils/utils")

module.exports = router

router.post('/user/bank-account', async function (req, res) {    
    /* Criando user */
    
    if(!req.body.nome){
        res.status(400).send({"Error": "Missing name."})
        return
    }
    if(!req.body.cpf){
        res.status(400).send({"Error": "Missing CPF document."})
        return
    }
    if(!req.body.datanascimento){
        res.status(400).send({"Error": "Missing birthday date."})
        return
    }

    let creation = await pgsql.createNewUser(req.body.nome, req.body.cpf, req.body.datanascimento)

    /* Abrindo conta */

    let nome = '%' + req.body.nome + '%'
    let foundPerson =  await pgsql.getOnePersonByName(nome)
    let idPessoa = foundPerson.rows[0].idpessoa;

    if(!req.body.saldo){
        return res.status(400).send({"message": "Invalid total balance."})
    }
    
    if(!req.body.limiteSaqueDiario){
        return res.status(400).send({"message": "Invalid balance withdraw."})
    }
    
    /* Abrindo conta do banco */

    pgsql.createUserBankAccount(idPessoa, req.body.saldo, req.body.limiteSaqueDiario).then((response) => {
        res.status(201).send({"message": "Both person and account were created successfully."})
    }).catch((err) => {
        res.send(err)
    })

    return
})

router.get(`/user/:filter?`, async function (req, res) {
    if(!req.params.filter){
        pgsql.getAllPersons().then((response) => {
            res.send(response.rows)
        }).catch((err) => {
            res.send(err)
        })
        return
    } if(isNaN(parseInt(req.params.filter))){
        let nome = '%' + req.params.filter + '%'
        pgsql.getOnePersonByName(nome).then((response) => {
            res.send(response.rows)
        }).catch((err) => {
            res.send(err)
        })
        return
    } if (!isNaN(parseInt(req.params.filter))){
        pgsql.getOnePerson(req.params.filter).then((response) => {
            res.send(response.rows)
        }).catch((err) => {
            res.send(err)
        })
        return
    }
})

router.get('/user/:id/bank-account', async function (req, res) {
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    pgsql.getUserBankAccount(req.params.id).then((response) => {
        res.status(200).send(response.rows)
    }).catch((err) => {
        res.send(err)
    })
    return
})

router.get('/user/:id/bank-account/balance/', async function (req, res) {
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    pgsql.getUserBankAccount(req.params.id).then((response) => {
        res.status(200).send(response.rows[0].saldo)
    }).catch((err) => {
        res.send(err)
    })
    return
})

router.get('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Verifica integridade dos dados */
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    
    let conta = await pgsql.getUserBankAccount(req.params.id)
    let idConta = conta.rows[0].idconta;

    if(conta.rows.length = 0){
        res.status(400).send({"message": "This user does not have any bank account yet."})
        return
    }

    if(idConta != req.params.id_conta){
        res.status(400).send({"message": "The informed bank account is not linked to this person.", "accountIdFound": idConta})
        return
    }
    
    pgsql.listSinceLastMonthTransactions(idConta).then((response) => {
        res.status(200).send(response.rows)
    }).catch((err) => {
        res.send(err)
    })

    return
})

router.post('/user/:id/bank-account/:id_conta/transaction/', async function (req, res) {
    /* Verifica integridade dos dados */
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    
    let conta = await pgsql.getUserBankAccount(req.params.id)
    let idConta = conta.rows[0].idconta;

    if(conta.rows.length = 0){
        res.status(400).send({"message": "This user does not have any bank account yet."})
        return
    }

    if(idConta != req.params.id_conta){
        res.status(400).send({"message": "The informed bank account is not linked to this person.", "accountIdFound": idConta})
        return
    }

    if(!req.body.dataInicio){
        res.status(400).send({"message": "No initial date for transaction informations was informed."})
        return
    }
    
    if(!req.body.dataFinal){
        res.status(400).send({"message": "No final date for transaction informations  was informed."})
        return
    }

    if(req.body.dataInicio > req.body.dataFinal){
        res.status(400).send({"message": "The final date cannot be lesser than the initial one."})
        return
    }
    
    pgsql.listTransactionsByTime(idConta, req.body.dataInicio, req.body.dataFinal).then((response) => {
        res.status(201).send(response.rows)
    }).catch((err) => {
        res.send(err)
    })

    return
})

router.post('/user/:id/bank-account/:id_conta/transaction/:type/', async function (req, res) {
    /* Verifica integridade dos dados */
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    
    let conta = await pgsql.getUserBankAccount(req.params.id)
    let idConta = conta.rows[0].idconta;

    if(conta.rows.length = 0){
        res.status(400).send({"message": "This user does not have any bank account yet."})
        return
    }

    if(idConta != req.params.id_conta){
        res.status(400).send({"message": "The informed bank account is not linked to this person.", "accountIdFound": idConta})
        return
    }

    if(!req.body.valor){
        res.status(400).send({"message": "No amount for this transaction was informed."})
        return
    }
    
    let valor = parseFloat(req.body.valor)

    /* Se for deposito */
    if(req.params.type = "1") {
        pgsql.createTransactionAccount(idConta, valor).then((response) => {
            res.status(201).send(response.rows)
        }).catch((err) => {
            res.send(err)
        })
    } else {
        /* Se for saque, verifica se o valor se encontra negativo */
        if(valor > 0){
            valor = valor * (-1);
        }
        pgsql.createTransactionAccount(idConta, valor).then((response) => {
            res.status(201).send(response.rows)
        }).catch((err) => {
            res.send(err)
        })
    }
    return
})

router.post('/user/:id/bank-account/:id_conta/toogleActivity', async function (req, res) {
    /* Verifica integridade dos dados */
    if(parseInt(req.params.id) <= 0){
        res.status(400).send({"message": "This is not a valid number. Identity must be greater than 0."});
        return;
    }
    
    let conta = await pgsql.getUserBankAccount(req.params.id)
    let idConta = conta.rows[0].idconta;
    let status = conta.rows[0].flagative;

    if(conta.rows.length = 0){
        res.status(400).send({"message": "This user does not have any bank account yet."})
        return
    }

    if(idConta != req.params.id_conta){
        res.status(400).send({"message": "The informed bank account is not linked to this person.", "accountIdFound": idConta})
        return
    }

    if(status == true){
        pgsql.toogleAtivityFromAccount(idConta, false).then((response) => {
            res.status(200).send({"message": "The bank account status was set as desactivated."})
        }).catch((err) => {
            res.send(err)
        })
    } else {
        pgsql.toogleAtivityFromAccount(idConta, true).then((response) => {
            res.status(200).send({"message": "The bank account status was set as activated."})
        }).catch((err) => {
            res.send(err)
        })
    }

    return
})

router.allRoutes = utils.getAllRoutes(router);

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