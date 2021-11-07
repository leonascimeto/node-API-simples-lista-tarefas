const mongoose = require("mongoose");
const url = 'mongodb://localhost:27017/noderest';
mongoose.connect(url, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;