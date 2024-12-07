//@ts-check
const { ExtClient } = require('./ext/ExtClient.js');
const appServer = require('./views/server.js');

(async () => {
    const client = new ExtClient();
    await appServer(client);
    await client.start();
})();

