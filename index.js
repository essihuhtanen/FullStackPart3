const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const getRandomId = () => {
  return Math.floor(Math.random() * 1000);
};

morgan.token("body", (req, res) => {
  if (Object.keys(req.body).length > 0) return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("build"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((curr) => curr.id === id);
  person ? response.json(person) : response.status(404).end();
});

app.get("/api/info", (request, response) => {
  const now = new Date();
  const content = `<div>
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${now}</p>
  </div>`;
  response.send(content);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: "Name missing",
    });
  }
  if (!request.body.number) {
    return response.status(400).json({
      error: "Number missing",
    });
  }
  const newPerson = { id: getRandomId(), ...request.body };
  persons = persons.concat(newPerson);
  response.status(201).json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
