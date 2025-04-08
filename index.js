
require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

//Middleware for serving static files
app.use(express.static('dist'))


app.use(express.json())
app.use(requestLogger)


//Morgan middleware
const morgan = require('morgan')

morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))




//GET REQUESTS

  app.get('/', (request, response) => {
    response.send('<h1>Hello World - again!</h1>')
  })

  app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
      response.json(person)
    })
  })

  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then((person) => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch((error) => next(error))
  })

  app.get('/api/info', (request, response, next) => {
    Person.countDocuments({})
      .then(count => {
        const info = {
          info: `Phonebook currently has ${count} contacts`,
          date: new Date(),
        };
        response.json(info);
      })
      .catch(error => next(error));
  });
  
  //POST REQUESTS
  app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body;
  
    if (!name || !number) {
      return response.status(400).json({ error: 'content missing' });
    }
  
    //PUT if name already exists
    Person.findOne({ name })
      .then(existingPerson => {
        if (existingPerson) {
          existingPerson.number = number;
          return existingPerson.save().then(updatedPerson => {
            return response.json(updatedPerson);
          });
        }
  
        const person = new Person({ name, number });
        return person.save().then(savedPerson => {
          return response.json(savedPerson);
        });
      })

      .catch(error => 
        next(error));
  });


  //PUT REQUESTS

  app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
  
    Person.findById(request.params.id)
      .then((person) => {
        if (!person) {
          return response.status(404).end()
        }
  
        person.name = name
        person.number = number
  
        return person.save().then((UpdatedPerson) => {
          response.json(UpdatedPerson)
        })
      })
      .catch((error) => next(error))
  })



  //DELETE REQUESTS

  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then((result) => {
        response.status(204).end()
      })
      .catch((error) => next(error))
  })


  //Error handling
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  app.use(unknownEndpoint)
  app.use(errorHandler)

  //Listening to
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

