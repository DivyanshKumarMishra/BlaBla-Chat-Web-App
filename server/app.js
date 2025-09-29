require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const colors = require('colors');
const { basePath } = require('./utils');

const app = express();
const server = require('http').createServer(app);
const authRouter = require('./routes/authRouter');
const chatRouter = require('./routes/chatRouter');
const userRouter = require('./routes/userRouter');
const messageRouter = require('./routes/messageRouter');
const tokenVerification = require('./middlewares/token_verify');
const { setupCircuit } = require('./circuit');
const connectToDB = require('./db_config');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/errorMiddleware');
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const origin = process.env.ORIGIN;

app.use(
  cors({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

app.use(express.static(path.join(basePath, 'public')));
app.use(
  '/uploads/profiles',
  express.static(path.join(basePath, 'uploads/profiles'))
);
app.use('/uploads/files', express.static(path.join(basePath, 'uploads/files')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use(tokenVerification);

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function runServer() {
  try {
    server.listen(port, async () => {
      await connectToDB();
      console.log(`server started on port ${port}`.cyan);
      setupCircuit(server);
    });
  } catch (error) {
    console.log(`something went wrong: ${error.message}`.red);
    process.exit();
  }
}

runServer();
