/* Libaries */
const { Router } = require('express');
const express = require('express')
var app = express();
const bodyParser = require("body-parser")
const {match} = require('path-to-regexp')
const utils = require('./utils/utils')

/* Routes */
const bank_account = require('./controllers/bank_account.js')
const transactions = require('./controllers/transactions.js')
const users = require('./controllers/users.js')

/* Setting Body Parser */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Database Connection */
const queries = require("./connection/queries")

/* Setting routes */
app.use('/', bank_account)
app.use('/', transactions)
app.use('/', users)

/* Application start with database availability verification */
port = 80
async function start(){
    queries.connect().then((connection) => {
        if(connection.status == 500){
            console.log("It was not possible to connect with our database")
        } else {
            app.listen(port);
            console.log("Running on http://localhost:80")
        }
    }).catch((err) => {
        console.log(err.message)
    })
}

start()

/* Database implemented with Docker:
docker run --name banking-psql -e POSTGRES_PASSWORD=#C4tf1shB4nkInG -p 5432:5432 -d postgres 
*/