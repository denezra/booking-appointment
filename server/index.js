require('dotenv').config();
const express = require('express');
const dbConfig = require('./api/config/dbConfig');
const routes = require('./api/routes/index')
const http = require('http')
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/v1", routes)

const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, () => console.log(`Node server started at port ${port}`));

