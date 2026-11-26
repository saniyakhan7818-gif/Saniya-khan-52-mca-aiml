const express = require('express')
const mongoose = require('mongoose')
const productRoutes = require('./routes/product.route')
const app = express()

app.use(express.json())

// app.use('/',(req,res)=>{
// res.send('Server is running')
// })
app.use('/api',productRoutes)
const PORT = 3000
mongoose.connect('mongodb://localhost:27017/Q11').then(()=>{
    console.log('Successfully Connnected to mongoDb')
    app.listen(PORT,()=>{
        console.log(`Server is running on ${PORT}`)
    })
}).catch(err=>{
    console.error('MongoDb connection error:',err)
})

