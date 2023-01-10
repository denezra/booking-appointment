require('dotenv').config();
const express = require('express');
const dbConfig = require('./config/dbConfig');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const doctorRoute = require('./routes/doctor');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/doctor', doctorRoute);


app.use((req, res, next) =>
{
    res.status(404).send(
        "<h1>Page not found on the server</h1>")
})
const port = process.env.PORT || 5000;

// app.use('/', express.static('client/build'));
// app.get('*', (req, res) => {
// 	res.sendFile(path.resolve(__dirname, 'client/build/index.html'));
// });

app.listen(port, () => console.log(`Node server started at port ${port}`));
