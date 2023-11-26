const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 4000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const admin = require("firebase-admin");
const serviceAccount = require("./volunteer-network-fd681-firebase-adminsdk-jjjq2-7c4d2030b9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    .then(() => coll.find({}).toArray())
    .then(result => {
        res.send(result);
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => client.close());
});

app.get('/registrations', (req, res) => {
    const coll = db.collection("registration");
    client.connect()
    .then(() => coll.find({}).toArray())
    .then(result => {
        res.send(result);
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => client.close());
});

app.get('/events', (req, res) => {
    const bearer = req.headers.authorization;
    const coll = db.collection("registration");
    let userEmail;
    if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            if (tokenEmail === req.query.email) {
                userEmail = tokenEmail;
            }
        })
        .catch(error => {
            console.log(error);
        });
    }

    client.connect()
    .then(() => coll.find({email:userEmail}).toArray())
    .then(result => {
        res.send(result);
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => client.close());
});

app.post('/register', (req, res) => {
    const info = req.body;
    const coll = db.collection("registration");
    client.connect()
    .then(() => coll.insertOne(info))
    .then(result => {
        res.send(result);
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => client.close());
    console.log(info);
});

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const coll = db.collection("registration");
    client.connect()
    .then(() => coll.deleteOne({_id: new ObjectId(id)}))
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => client.close());
});

app.listen(process.env.PORT || port);