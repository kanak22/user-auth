const dotenv = require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const userRoute = require('./routes/User');

const app = express();
const port = 3000;

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use('/api/user', userRoute);

const url = process.env.MONGODB_URL;
mongoose.set('strictQuery', false);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
});
