import express from 'express'
import morgan from 'morgan'
import {Server as Socketserver } from 'socket.io'
import http from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import router from './routes/Registro/registroApis.js'
import login from './routes/login/InicioSesion.js';
import referidoApis from './routes/arbol-referidos/referidoApis.js'
import rutasSeguridad from './routes/seguridad/rutas.js'
import dot from 'dotenv'
import fileUpload from 'express-fileupload'

import conexion from './conexion/conexion.js'

//import db from './database/db.js'


//configuracion a mongoose
mongoose.Promise = global.Promise 


const app = express()




//Creamos el servidor con el modulo http
const server = http.createServer(app)
const io = new Socketserver(server,{
    cors:{
        origin: '*'
    }
})

//conexion de middlewares
app.use(fileUpload({
    useTempFiles : false,
    createParentPath: true

}));

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())


//apis - rutas
app.use('/api', router)

app.use('/api/referido', referidoApis)
app.use('/api/login', login)
app.use('/api/seguridad', rutasSeguridad)





io.on('connection', (socket)=>{
    console.log(socket.id)
    console.log("Cliente conectado")


    socket.on('message',(message,nickname)=>{
        socket.broadcast.emit('message',{
            body: message,
            from: nickname
        })
    })
})



//variables de entorno
dot.config();







//conexion a la BDD Y PETICIONES
conexion(server);