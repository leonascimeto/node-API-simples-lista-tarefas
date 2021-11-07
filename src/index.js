const express = require("express");
const app = express();

app.use(express.json());

require('./app/controllers/authController')(app);
require('./app/controllers/projectController')(app);

app.listen(3000, () => console.log("API Running..."));