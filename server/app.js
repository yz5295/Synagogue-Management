const express = require("express");
const users = require("./routes/users");
const congratulations = require("./routes/congratulations");
const messageadmin = require("./routes/message-admin");
const prayertimes = require("./routes/prayer-times");
const settings = require("./routes/settings");
const donation = require("./routes/donation");
const eventlist = require("./routes/eventlist");
const messages = require("./routes/messages");
const financemanager = require("./routes/finance-manager");
const sendmail = require("./routes/sendmail");
const payment = require("./routes/payment");
const forgotpassword = require("./routes/forgot-password");

const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/users", users);
app.use("/congratulations", congratulations);
app.use("/messageAdmin", messageadmin);
app.use("/prayer-times", prayertimes);
app.use("/settings", settings);
app.use("/donation", donation);
app.use("/eventlist", eventlist);
app.use("/messages", messages);
app.use("/financemanager", financemanager);
app.use("/sendmail", sendmail);
app.use("/payment", payment);
app.use("/forgot-password", forgotpassword);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
