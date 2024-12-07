//@ts-check
const { createClient } = require('redis');
const Config = require('../config.js');

const redis = createClient({ legacyMode: false });

module.exports = { redis }