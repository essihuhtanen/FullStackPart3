require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

morgan.token('body', (req) => {
  if (Object.keys(req.body).length > 0) return JSON.stringify(req.body)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'faulty request' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)
app.use(express.static('build'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result)
    })
    .catch((err) => next(err))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      person ? response.json(person) : response.status(404).end()
    })
    .catch((error) => next(error))
})

app.get('/api/info', (request, response) => {
  const now = new Date()
  Person.find({}).then((result) => {
    const content = `<div>
  <p>Phonebook has info for ${result.length} people</p>
  <p>${now}</p>
  </div>`
    response.send(content)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: 'Name missing',
    })
  }
  if (!request.body.number) {
    return response.status(400).json({
      error: 'Number missing',
    })
  }

  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  })
  person
    .save()
    .then((newPerson) => response.json(newPerson))
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: 'Name missing',
    })
  }
  if (!request.body.number) {
    return response.status(400).json({
      error: 'Number missing',
    })
  }

  const updatedPerson = request.body

  Person.findOneAndUpdate(
    { name: updatedPerson.name },
    { number: updatedPerson.number },
    { new: true }
  )
    .then((updated) => response.json(updated))
    .catch((error) => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
