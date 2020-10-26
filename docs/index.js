const itemValidity = 1;
const storeState = [[false, false, false], [false, false, false], [false, false, false]]

let contracts = []
const contract_address_1 = "0x6a38f689Af12CaeFCfA35b84cF486Ff1D94a48BE";
const contract_address_2 = "0x3923e3E580683E9a367d31Beab31813091c963dc";
const contract_address_3 = "0x34C2784C467f6ecD1a1a2F91eB7D9A6dfAee4755";

const contract_abi = [
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "_beneficiary",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "AuctionEnded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "bidder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "HighestBidIncreased",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "validity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "buyItem",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cancelContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "collectAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "gameOwner",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isActive",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ownerAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "retrieveAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "seeItem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_outOfValidityDate",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }

];

window.onload = async function () {
    await LoadDocument();
};



const ethEnabled = () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.web3.currentProvider);
        window.ethereum.enable();
        return true;
    }
    return false;
}

if (!ethEnabled()) {
    alert("Metamask or browser with Ethereum not detected!");
}

else {
    contracts[0] = new web3.eth.Contract(contract_abi, contract_address_1);
    contracts[1] = new web3.eth.Contract(contract_abi, contract_address_2);
    contracts[2] = new web3.eth.Contract(contract_abi, contract_address_3);
    saveCoinbase();
}

async function saveCoinbase() {
    window.coinbase = await window.web3.eth.getCoinbase();
};

async function LoadDocument() {
    if (document.readyState === "complete") {
        return;
    }

    let promiseResolve = null;
    const promise = new Promise((resolve, _reject) => {
        promiseResolve = resolve;
    });
    window.addEventListener("load", () => { promiseResolve(); });

    await promise;
}

async function OnItemClick(gameIndex, itemIndex, value) {
    if (storeState[gameIndex][itemIndex]) {
        console.log("Withdraw item");
        if (await contracts[gameIndex].methods.withdraw().send()) {
            storeState[gameIndex][itemIndex] = false;
        }
    }
    else {
        storeState[gameIndex][itemIndex] = true;
        await contracts[gameIndex].methods.buyItem(itemValidity, value).send(value, { from: window.coinbase });
        console.log("Buy item");
    }
    UpdateView();
}

async function OnAmountClick(gameIndex) {
    if (await contracts[gameIndex].isActive().call())
        await contracts[gameIndex].collectAmount().send();
    await contracts[gameIndex].retrieveAmount().send();
    UpdateView();
}

async function OnCancelGameClick(gameIndex) {
    await contracts[gameIndex].cancelContract().send();
    const covers = document.getElementsByClassName("fit");
    covers[gameIndex].style.backgroundImage = "";
    covers[gameIndex].style.backgroundColor = "#ffc478";
    UpdateView();
}

async function UpdateView() {
    document.getElementById("validity").textContent = itemValidity;

    const items = document.getElementsByClassName("item button");
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (storeState[i][j])
                items[j + 3 * i].style.color = "#62a395";
            else
                items[j + 3 * i].style.color = "#7abdae";
        }
    }
    const currency = document.getElementsByClassName("currency");
    for (var i = 0; i < 3; i++) {
        currency[i].textContent = await contracts[i].ownerAmount().call();
    }
} 