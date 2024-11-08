import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

  
  // app.use(cors({
  //   origin: ['https://trendify-made-because-of-job-project-1.onrender.com', 'https://trendify-made-because-of-job-project.onrender.com',],
  //   methods:['GET,PATCH,POST,DELETE,PUT'],
  //   credentials: true,
  // }
  // ));

  app.use(cors({
    origin: ['http://localhost:4000'],
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