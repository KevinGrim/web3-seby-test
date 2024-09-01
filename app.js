import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

const CONTRACT_ADDRESS = '5Gpj9qiRheTZSmBz8wZYmrvrY9UjzqYWc6PVedLTBJhy63Db';
const PROVIDER_URL = 'wss://aleph-zero-node-url'; // Ersetze durch die tatsächliche URL
const TOKEN_AMOUNT = 1000000000000; // 100 Token (in kleinster Einheit)

async function initBlockchain() {
    const provider = new WsProvider(PROVIDER_URL);
    const api = await ApiPromise.create({ provider });
    return api;
}

async function getUserAccount() {
    await web3Enable('Minigame');
    const allAccounts = await web3Accounts();
    return allAccounts[0].address; 
}

async function executeTransaction(api, sender, recipient, amount) {
    const keyring = new Keyring({ type: 'sr25519' });
    const transfer = api.tx.balances.transfer(recipient, amount);

    const { web3FromSource } = await import('@polkadot/extension-dapp');
    const injector = await web3FromSource(sender.meta.source);

    return transfer.signAndSend(sender.address, { signer: injector.signer });
}

document.getElementById('playButton').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Starte Transaktion...';

    try {
        const api = await initBlockchain();
        const userAccount = await getUserAccount();
        
        const result = await executeTransaction(api, userAccount, CONTRACT_ADDRESS, TOKEN_AMOUNT);
        document.getElementById('status').innerText = `Transaktion erfolgreich: ${result}`;
        
        startGame(); 
    } catch (error) {
        console.error('Fehler bei der Transaktion:', error);
        document.getElementById('status').innerText = 'Transaktion fehlgeschlagen. Versuche es erneut.';
    }
});

function startGame() {
    document.getElementById('gameArea').innerHTML = '<p>Das Spiel läuft! Viel Spaß!</p>';
}
