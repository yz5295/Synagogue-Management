const express = require("express");
const users = require("./routes/users");
const congratulations = require("./routes/congratulations");
const messageAdmin = require("./routes/messageAdmin");
const prayertimes = require("./routes/prayertimes");
const settings = require("./routes/settings");
const donation = require("./routes/donation");
const eventlist = require("./routes/eventlist");
const messages = require("./routes/messages");
const financemanager = require("./routes/financemanager");
const sendmail = require("./routes/sendmail");
const payment = require("./routes/payment");

const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/users", users);
app.use("/congratulations", congratulations);
app.use("/messageAdmin", messageAdmin);
app.use("/prayer-times", prayertimes);
app.use("/settings", settings);
app.use("/donation", donation);
app.use("/eventlist", eventlist);
app.use("/messages", messages);
app.use("/financemanager", financemanager);
app.use("/sendmail", sendmail);
app.use("/payment", payment);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
