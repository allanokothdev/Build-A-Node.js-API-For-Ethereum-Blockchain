var IPFSInbox = artifacts.require("../contracts/Inbox.sol")
module.exports = function(deployer) {
    deployer.deploy(IPFSInbox)
}