const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const colors = require("colors");

const usersRoutes = require("./routes/users-routes");
const accountRoutes = require("./routes/account-routes");
const financeRoutes = require("./routes/finance-routes");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

// routes
app.use("/api/users", usersRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/finance", financeRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

const PORT = process.env.PORT || 3001;

mongoose
  .connect(
    "mongodb+srv://adam:dashAdmin123@money-dash-xih1x.mongodb.net/moneydash?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`.yellow.bold);
    });
  })
  .catch(err => {
    console.log(err);
  });
