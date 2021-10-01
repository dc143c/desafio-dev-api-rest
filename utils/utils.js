const responseModel = require("../middlewares/response-model.json")
const middleware = require("../middlewares/middleware");
const { cpf } = require("cpf-cnpj-validator");
const moment = require("moment");

/* Ainda havendo muitas repetições, dessa vez de 
funções de validação quanto aos parâmetros passados, foram implementadas as funções funcionais. */

let funcionalities = {}

funcionalities.getAllRoutes = (app) => {
    var routes = [];

    app.stack.forEach(function(stack){
        if(stack.route){
            routes.push({"path": stack.route.path, "method": stack.route.methods});
        }
    });

    routes.pop();
    return routes;
}

funcionalities.checkInformation = async (idperson, idaccount, amount, dateInit, dateFin, transacType) => {
    return new Promise(async (resolve, reject) => {
        let validation = {}    
        validation.transacTypeInRange = true
        validation.isAmountNumber = true
        validation.dateFinValidated = true
        validation.dateInitValidated = true
        validation.dateInitOnRange = true
        validation.idPersonValidated = true
        validation.personExists = true
        validation.bankAcountExists = true
        validation.bankAcountMatches = true
    
        let id_person = parseFloat(idperson)
        let id_conta = parseFloat(idaccount)
        let response = responseModel;
        if(id_person){
            if(id_person <= 0){
                validation.idPersonValidated = false;
            }
            try{
                let foundPerson =  await middleware.getOnePerson(id_person)
                validation.personExists = false;
                if(foundPerson.length > 0){
                    validation.personExists = true;
                    if(id_conta){
                        let idPessoa = foundPerson[0].idpessoa;
                        let foundBankAccount = await middleware.getUserBankAccount(idPessoa)
                        validation.bankAcountExists = false;
                        if(foundBankAccount.length > 0){
                            validation.bankAcountExists = true;
                            validation.foundBankAccountID = foundBankAccount[0].idconta
                            if(foundBankAccount[0].idconta != id_conta) {
                                validation.bankAcountMatches = false
                            }
                        }
                    }
                }
            } catch(err) { 
                console.log(err)
                response["row-count"] = 0;
                response["error"]["status"] = true;
                response["error"]["message"] = "Something may happened at our internal server.";
                response["results"] = err;
                resolve(response)
            }
        } 
        if(amount){
            if(isNaN(parseFloat(amount))){
                validation.isAmountNumber = false
            }
        }
        if(dateFin && dateInit){
            if(!moment(dateFin, 'MM/DD/YYYY',true).isValid()){
                validation.dateFinValidated = false
            }
            
            if(!moment(dateInit, 'MM/DD/YYYY',true).isValid()){
                validation.dateFinValidated = false
            }
    
            if(dateInit > dateFin){
                validation.dateInitOnRange = false
            }
        }
        if(transacType){
            if(transacType > 2){
                validation.transacTypeInRange = false
            }
        }
    
        if(validation.idPersonValidated = false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "This is not a valid number. Identity must be greater than 0.";
            resolve(response);
        }
    
        if(validation.personExists = false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "This user does not have any bank account yet.";
            resolve(response);
        }
    
        if(validation.bankAcountExists == false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "This user does not have any bank account yet.";
            resolve(response);
        }
    
        if(validation.bankAcountMatches == false) {
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = {"accountIdFound": validation.foundBankAccountID};
            response["error"]["message"] = "The informed bank account is not linked to this person.";
            resolve(response);
        }
    
        if(validation.isAmountNumber == false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Informed amount is not a number.";
            resolve(response);
        }
    
        if(validation.dateFinValidated == false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Final date is not formated as MM/DD/YYYY";
            resolve(response);
        }
        
        if(validation.dateInitValidated == false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Initial date is not formated as MM/DD/YYYY";
            resolve(response);
        }
    
        if(validation.dateInitOnRange == false){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Initial date cannot be bigger than final date.";
            resolve(response);
        }
    
        resolve(true);
    })
}

funcionalities.checkCreationInformation = async (nome, doc, datanascimento, saldo, limiteSaqueDiario) => {
    return new Promise(async (resolve, reject) => {
        let response = responseModel;
    
        if(!nome){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Missing name.";
            resolve(response);
        }
    
        if(!doc){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Missing CPF document.";
            resolve(response);
        }
    
        if(!datanascimento){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Missing birthday date. Make sure that dateformat is MDY.";
            resolve(response);
        }
    
        if(!saldo){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Invalid or missing account balance.";
            resolve(response)
        }
    
        if(!limiteSaqueDiario){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Invalid balance withdraw.";
            resolve(response)
        }
        try{
            let nomeFormatado = '%' + nome + '%'
            let foundPerson =  await middleware.getOnePersonByName(nomeFormatado)
            if(foundPerson.length > 0){
                let bankStatus = await middleware.getUserBankAccount(foundPerson[0].idpessoa)
                if(bankStatus.length > 0){
                    response["row-count"] = 0;
                    response["results"] = foundPerson;
                    response["error"]["status"] = true;
                    response["error"]["message"] = "This user is already with an account.";
                    resolve(response);
                }
            }
    
            if(!cpf.isValid(doc)){
                response["row-count"] = 0;
                response["results"] = [];
                response["error"]["status"] = true;
                response["error"]["message"] = "Not valid CPF document.";
                resolve(response);
            }
        } catch(err) {
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = err;
            response["error"]["message"] = "Something appears to had happened on data verification.";
            resolve(response);
        }
        if(!moment(datanascimento, 'MM/DD/YYYY',true).isValid()){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Missing birthday date. Make sure that dateformat is MDY.";
            resolve(response);
        }
        
        if(datanascimento > moment().format("MM/DD/YYYY")){
            response["row-count"] = 0;
            response["results"] = [];
            response["error"]["status"] = true;
            response["error"]["message"] = "Unless you are from the future, you cannot insert this birth date.";
            resolve(response);
        }
    
        if(isNaN(parseFloat(saldo))){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Invalid balance.";
            resolve(response);
        }
    
        if(isNaN(parseFloat(limiteSaqueDiario))){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Invalid balance withdraw.";
            resolve(response)
        }
    
        if(!isNaN(parseFloat(limiteSaqueDiario)) && limiteSaqueDiario < 0){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "Invalid balance withdraw. It must be positive, right?";
            resolve(response)
        }
    
        resolve(true)
    })
}

funcionalities.checkIdentifiers = (id) => {
    return new Promise((resolve, reject) => {
        let response = responseModel;
        if(isNaN(id)){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["error"]["message"] = "User identifiers are only setted as Integers.";
            response["results"] = [];
            resolve(response);
        }
        if(id < 0){
            response["row-count"] = 0;
            response["error"]["status"] = true;
            response["results"] = [];
            response["error"]["message"] = "This is not a valid number. Identity must be greater than 0.";
            resolve(response);
        }
        resolve(true);
      })
}

module.exports = funcionalities;