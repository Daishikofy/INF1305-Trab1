const contract_address_1 = "TODO";
const contract_address_2 = "TODO";
const contract_address_3 = "TODO";

const contract_abi = [
    "TODO"
];

const ethEnabled = () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
        return true;
    }
    return false;
}

async function saveCoinbase() {
    window.coinbase = await window.web3.eth.getCoinbase();
};

if (!ethEnabled()) {
    alert("Metamask or browser with Ethereum not detected!");
}
else {
    window.Game1 = new web3.eth.Contract(contract_abi, contract_address_1);
    window.Game2 = new web3.eth.Contract(contract_abi, contract_address_2);
    window.Game3 = new web3.eth.Contract(contract_abi, contract_address_3);
    saveCoinbase();
}