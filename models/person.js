const mongoose = require('mongoose')
const url = process.env.MONGO_URI

mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  id: Number,
  name: { type: String, minLength: 3 },
  number: {
    type: String,
    validator: function (v) {
      return /^\d{2,3}-\d+$/.test(v)
    },
    minLength: 8,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
