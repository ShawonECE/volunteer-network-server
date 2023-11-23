const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 4000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5yhhqym.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = client.db("volunteer");

app.get('/', (req, res) => {
    res.send('welcome to the volunteer network');
});

app.get('/works', (req, res) => {
    const coll = db.collection("works");
    client.connect()
    .then(() =>coll.find({}).toArray())
    .then(result => {
        res.send(result);
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => client.close());
});

app.listen(process.env.PORT || port);