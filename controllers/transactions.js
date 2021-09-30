const express = require('express')
const router = express.Router()

module.exports = router
let route_name = "/transaction"

router.get(`${route_name}/:id/`, async function (req, res) {
    res.send("transaction List")
})

