require('dotenv').config();

const express = require('express')
const app = express()
const routes = require('./routes')
const web3 = require('web3')
const mongodb = require('mongodb').MongoClient
const contract = require('truffle-contract')
const artifacts = require('./build/Inbox.json');
app.use(express.json())

if(typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
} else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}

const LMS = contract(artifacts)
LMS.setProvider(web3,currentProvider)

mongodb.connect(process.env.DB, { useUnifiedTopology: true }, async (err, client) => {
    const db = client.db('Cluster0')
    const accounts = await web3.eth.getAccounts();
    const lms = await LMS.deployed();
    //  Home
    routes(app,db, accounts)
    app.listen(process.env.PORT || 8082, () => {
        console.log('listening on Port 8082');
    })
})