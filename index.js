const express = require('express')
const app = express()

app.use(express.json());

const cors = require('cors')

app.use(cors())



let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
] 

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
    response.json(persons)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

  app.get('/api/info', (request, response) => {
    const info = {
      info: `Phonebook has info for ${persons.length} people`,
      date: new Date(),
    }
    response.json(info)
  })
  
  //POST REQUESTS

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    
  const nameAlreadyExists = persons.some(person => person.name === body.name)

    if (nameAlreadyExists) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
  }

    const generateId = () => {
      return Math.floor(Math.random() * 1000000).toString();
    }
  
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }

    persons = persons.concat(person)
  
    response.json(person)
  })

  //DELETE REQUESTS

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })



  //Listening to
  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })




