const express = require("express");
const session = require("express-session");
const redis = require("redis");
let redisStore = require("connect-redis")(session);

const app = express();
app.use(express.json());

const mongoose = require("mongoose");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require("./config/config");

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const connectWithRetry = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected to database");
  } catch (error) {
    setTimeout(connectWithRetry, 5000);
    console.error(error);
  }
};

connectWithRetry();

app.use(
  session({
    store: new redisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 3000000,
    },
  })
);

app.get("/", (req, res) => {
  res.send("<h2>Hi There  !!!</h2>");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server connected to port ${port}`));
