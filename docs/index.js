const itemValidity = 1;
const moneySpent = 0;
const storeState = [[false, false, false], [false, false, false], [false, false, false]]

let contracts = []
const contract_address_1 = "0x68eb5468269f60912B3E8fC122c288716Ba2f9d4";
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
    UpdateView();
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
    window.Contract1 = new web3.eth.Contract(contract_abi, contract_address_1);
    window.Contract2 = new web3.eth.Contract(contract_abi, contract_address_2);
    window.Contract3 = new web3.eth.Contract(contract_abi, contract_address_3);

    contracts[0] = window.Contract1;
    contracts[1] = window.Contract2;
    contracts[2] = window.Contract3;

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

async function OnItemClick(gameIndex, itemIndex, itemValue) {
    console.log("Item click");

    const items = document.getElementsByClassName("item button");
    items[gameIndex + 3 * itemIndex].style.backgroundColor = "#ffc478";

    if (storeState[itemIndex][gameIndex] == true) {
        console.log("Withdraw item");
        if (await contracts[gameIndex].methods.withdraw().send({ from: window.coinbase, value: 0 })) {
            storeState[itemIndex][gameIndex] = false;            
        }
    }
    else {
        storeState[itemIndex][gameIndex] = true;
        await contracts[gameIndex].methods.buyItem(itemValidity, itemValue).send({ from: window.coinbase, value: itemValue });
        moneySpent += itemValue;
        console.log("Buy item");
    }
    UpdateView();
}

async function OnAmountClick(gameIndex) {
    console.log("Amount click");
    const items = document.getElementsByClassName("currency button");
    items[gameIndex].style.backgroundColor = "#ff8566";
    if (await contracts[gameIndex].methods.isActive().call())
        await contracts[gameIndex].methods.collectAmount().send({ from: window.coinbase, value: 0 });
    await contracts[gameIndex].methods.retrieveAmount().send({ from: window.coinbase, value: 0 });
    UpdateView();
}

async function OnCancelGameClick(gameIndex) {
    console.log("Cancel click");
    await contracts[gameIndex].methods.cancelContract().send({ from: window.coinbase, value: 0 });
    const covers = document.getElementsByClassName("fit");
    covers[gameIndex].style.backgroundImage = "";
    covers[gameIndex].style.backgroundColor = "#ffc478";
    UpdateView();
}

async function UpdateView() {
    document.getElementById("validity").textContent = itemValidity.toString() + " hour";
    document.getElementById("spent").textContent = moneySpent.toString() + " wei";
    const items = document.getElementsByClassName("item button");
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (storeState[i][j] == true)
                items[j + 3 * i].style.backgroundColor = "#62a395";
            else
                items[j + 3 * i].style.backgroundColor = "#7abdae";
        }
    }
    const currency = document.getElementsByClassName("currency");
    for (var i = 0; i < 3; i++) {
        currency[i].textContent = await contracts[i].methods.ownerAmount().call();
    }
} 