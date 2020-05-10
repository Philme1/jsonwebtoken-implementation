const express = require("express");

const connectDB = require("./config/db");
const app = express();

//Connect to Database
connectDB();

//Init bodyParser
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.json({
    message: "API WORKING"
  })
})


//Define Routes
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/auth"));
app.use("/auth", require("./routes/auth"));


const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("Server Running"));
