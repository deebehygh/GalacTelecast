const ExtClient  = require('./ext/ExtClient.js');

(async () => {
    const client = new ExtClient();
    await client.start();
})();

