require('dotenv').config();
const shortid = require('short-id')
const IPFS = require('ipfs-api');
const { Buffer } = require('buffer')

const auth = 'Basic ' + Buffer.from(process.env.projectId + ':' + process.env.projectSecret).toString('base64');
const ipfs = IPFS({ 
    host: 'ipfs.infura.io',
    port: 5001, 
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

function routes(app, dbe, lms, accounts){
    let db = dbe.collection('music-users')
    let music = dbe.collection('music-store')
    app.post('/register', (req, res) => {
        let email = req.body.email
        let idd = shortid.generate()
        if(email){
            db.findOne({email}, (err, doc) => {
                if(doc){
                    res.status(400).json({"status":"Failed", "reason": "Already Registered"})
                } else {
                    db.insertOne({email})
                    res.json({ "status": "success", "id": idd})
                }
            })
        } else {
            res.status(400).json({ "status": "Failed", "reason": "wrong input"})
        }
    })

    app.post('/login', (req, res) => {
        let email = req.body.email
        if(email){
            db.findOne({ email }, (err, doc) => {
                if(doc){
                    res.json({"status":"success", "id":doc.id})
                } else {
                    res.status(400).json({ "status": "Failed", "reason": "Not recognized"})
                }
            })
        } else {
            res.status(400).json({ "status": "Failed", "reason": "wrong input"})
        }
    })

    app.post('/upload', async (req, res) => {
        let buffer = req.body.buffer
        let name = req.body.name
        let title = req.body.title
        let id = shortid.generate() + shortid.generate()
        if(buffer && title){
            let ipfsHash = await ipfs.add(buffer)
            let hash = ipfsHash[0].hash
            lms.sendIPFS(id, hash, {from: accounts[0]})
            .then((_hash, _address) => {
                music.insertOne({id, hash, title, name})
                res.json({ "status": "success", id})
            }).catch(err => {
                res.status(500).json({ "status": "Failed", "reason": "Upload error ocurred"})
            })
        } else {
            res.status(400).json({ "status": "Failed", "reason": "wrong input"})
        }
    })

    app.get('/access/:email', (req, res) => {
        if(req.params.email){
            db.findOne({email: req.body.email}, (err, doc) => {
                if(doc){
                    let data = music.find().toArray()
                    res.json({"status":"success", data})
                }
            })
        } else {
            res.status(400).json({ "status": "Failed", "reason": "wrong input"})
        }
    } )

    app.get('/access/:email/:id', (req, res) => {
        let id = req.params.id
        if(req.params.id && req.params.email){
            db.findOne({ email:req.body.email}, (err, doc)=> {
                if(doc){
                    lms.getHash(id, {from: accounts[0]})
                    .then(async(hash) => {
                        let data = await ipfs.files.get(hash)
                        res.json({ "status":"success", data: data.content })
                    })
                } else {
                    res.status(400).json({ "status": "Failed", "reason": "wrong input"})
                }
            })
        } else {
            res.status(400).json({ "status": "Failed", "reason": "wrong input"})
        }
    })
}
module.exports = routes