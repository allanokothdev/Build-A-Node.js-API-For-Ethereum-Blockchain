const IPFSInbox = artifacts.require("../contracts/Inbox.sol")
contract("IPFSInbox", accounts => {
    it("emit event when you send a ipfs address", async() => {
        //  Alt for the contract
        const ipfsInbox = await IPFSInbox.deployed()

        //  Set a variable to false and get event listener
        eventEmitted = false
        //  var event = ()
        await ipfsInbox.ipfsSent((err, res) => {
            eventEmitted=true
        })

        //  Call the contract function which sends the ipfs address
        await ipfsInbox.sendIPFS(accounts[1], "sampleAddress", {from: accounts[0]})
        assert.equal(eventEmitted, true, "Sending an IPFS request does not emit an event")
    })
})