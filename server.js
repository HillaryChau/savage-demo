const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const leonUrl = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const myUrl = "mongodb+srv://rc:rc@rc21.qlizq.mongodb.net/myFirstDatabase?retryWrites=true";
const url = myUrl
const dbName = "rc"; //database name that I chose from Mongo

app.listen(3000, () => {
  MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("db ", db)
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  console.log("DB HERE PLEASE: ", db)
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {
      messages: result
    }) //this is where it is being served//
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({
    name: req.body.name,
    msg: req.body.msg,
    thumbUp: 0,
    thumbDown: 0
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages') //3obj shown in {} in the red plus 1 function //
    .findOneAndUpdate({
      name: req.body.name,
      msg: req.body.msg
    }, {
      $set: {
        thumbUp: req.body.thumbUp + 1
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})

app.put('/thumbDown', (req, res) => { //Put- creating and updating//
  db.collection('messages') // using the same collection
    .findOneAndUpdate({
      name: req.body.name,
      msg: req.body.msg
    }, {
      $set: {
        thumbUp: req.body.thumbUp - 1 //manipulating the same counter(the counter is named thumbUp as the thumbUp for the -1 function
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})



app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({
    name: req.body.name,
    msg: req.body.msg
  }, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
