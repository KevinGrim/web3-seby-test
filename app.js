console.log('Skripte geladen und app.js gestartet');

document.getElementById('playButton').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Starte Transaktion...';
    try {
        const api = await initBlockchain();
        const { address, signer } = await getUserAccount();

        await transferTokens(api, address, signer, '5Gpj9qiRheTZSmBz8wZYmrvrY9UjzqYWc6PVedLTBJhy63Db', 100);

        document.getElementById('status').innerText = 'Transaktion erfolgreich!';
        startGame();
    } catch (error) {
        console.error('Fehler bei der Transaktion:', error);
        document.getElementById('status').innerText = 'Transaktion fehlgeschlagen. Versuche es erneut.';
    }
});

// Initialisiere die Blockchain-Verbindung
async function initBlockchain() {
    console.log('Initialisiere Blockchain-Verbindung...');
    const provider = new polkadotApi.WsProvider('wss://mainnet.alephzero.org');
    const api = await polkadotApi.ApiPromise.create({ provider });
    await api.isReady;
    console.log('Blockchain verbunden');
    return api;
}

// Holen der Konten aus der SubWallet-Extension
async function getUserAccount() {
    console.log('Hole Benutzerkonto aus SubWallet...');
    const allInjected = await subwalletExtension.enable('Minigame');
    if (allInjected.length === 0) throw new Error('Keine SubWallet-Extension gefunden');

    const accounts = await subwalletExtension.web3Accounts();
    if (accounts.length === 0) throw new Error('Keine Konten gefunden');

    const injector = await subwalletExtension.web3FromAddress(accounts[0].address);
    return { address: accounts[0].address, signer: injector.signer };
}

// Transaktion ausführen
async function transferTokens(api, senderAddress, signer, recipient, amount) {
    console.log('Starte Token-Transfer...');
    return new Promise((resolve, reject) => {
        const transfer = api.tx.balances.transfer(recipient, amount * 10**12);

        transfer.signAndSend(senderAddress, { signer }, (result) => {
            if (result.status.isInBlock) {
                console.log(`Transaktion in Block ${result.status.asInBlock}`);
            } else if (result.status.isFinalized) {
                console.log(`Transaktion finalisiert in Block ${result.status.asFinalized}`);
                resolve(result.status.asFinalized.toString());
            }
        }).catch(reject);
    });
}

// Beispiel-Spiel-Logik
function startGame() {
    console.log('Spiel gestartet');
    document.getElementById('gameArea').innerHTML = '<p>Das Spiel läuft! Viel Spaß!</p>';
}
