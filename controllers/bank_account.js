const express = require('express')
const router = express.Router()

module.exports = router
let route_name = "/bank_account"

router.get(`${route_name}/:id/`, async function (req, res) {
    res.send("bank_account")
})




