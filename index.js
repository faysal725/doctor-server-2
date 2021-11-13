const express = require('express');
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hozny.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload())




const port = 5000;

app.get('/', (req, res) =>{
    res.send('hello from db its worasasdfking')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");

  app.post('/addAppointment', (req, res) => {
      //because this is a post request main data from frontend will be found in request body
      const appointment = req.body;
        console.log(appointment)
      //one item is inserted into db by appointmntCollection.inserOne 
      appointmentCollection.insertOne(appointment)

      //now response from db is sending
      .then(result => {
          res.send(result.insertedCount > 0)  
          //how many items is inserted into the db is counted by result.insertedCount

      })
  })


  app.post('/appointmentsByDate', (req, res) => {
    const date =  req.body;
    console.log(date.date1);
    const email = req.body.email
    
    doctorCollection.find({email: email}) // it will find the date within mongodb date: for match
    .toArray((err, doctors) => {            //whatever it gets from db it will make it array with toArray
      const filter = {date: date.date}
      if (doctors.length === 0) {
        
        filter.email = email;
      }


      appointmentCollection.find(filter) // it will find the date within mongodb date: for match
    .toArray((err, documents) => {            //whatever it gets from db it will make it array with toArray
      res.send(documents)
      console.log(documents)
        })

    })

  })

  app.get('/patients', (req, res) =>{
    appointmentCollection.find()
    .toArray((err, documents) =>{
      res.send(documents)
    })
    console.log('its done')
  })

  

  // how to upload file in server

  app.post('/addADoctor', (req, res) => {
    const file= req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name, email, file)
    file.mv(`${__dirname}/doctors/${file.name} `,  err =>{
      if (err) {
        console.log(err)
        return res.status(500).send({msg: 'failed to upload image'});
      }
      return res.send({name: file.name, path: `/${file.name}`})
    })    

    const path = `http://localhost:5000/${file.name}`
      console.log(path)
      const doctor={
          name: name,
          email: email,
          filePath: path
      }
      console.log(doctor)
      doctorCollection.insertOne(doctor)
      .then(result => {
          res.send(result.insertedCount)
      })
      console.log('database connected successfully')
  })
  
  

  
});



app.listen(process.env.PORT || port)