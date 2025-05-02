import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();



  app.use(cors({
    origin: ['http://localhost:4000','https://vibely-social-media-app-frontend.onrender.com'],
    credentials: true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import messageRouter from './routes/message.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/post",postRouter)
app.use("/api/v1/message", messageRouter)

export {app}