let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Report = Schema({
  reported: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  reporter: [
    {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  ]
});

module.exports = mongoose.model("ReportedAccounts", Report);
