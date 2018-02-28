const util = module.exports = {};

util.randomId = () => Date.now().toString(36) + (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);