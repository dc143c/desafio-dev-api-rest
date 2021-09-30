/* Libaries */
const { Router, response } = require('express');
const express = require('express')
var app = express();
const bodyParser = require("body-parser")
const {match} = require('path-to-regexp')
const utils = require('./utils/utils')

/* Routes */
const controllers = require('./controllers/controller.js')

/* Setting Body Parser */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Database Connection */
const queries = require("./connection/queries")

/* Setting routes */
app.use('/', controllers)

/* Check typos in URL */
app.get("*", function (request, response){
    response.send({"message":"This URL is not implemented in this project, you may want to take a closer look on our documentation for better understanding.", "documentation": "https://github.com/dc143c/","routes": controllers.allRoutes})
})

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