/** Database setup for BizTime. */

// const { Client } = require("pg");

// const client = new Client({
//   connectionString: "postgresql:///biztime"
// });

// client.connect();


// module.exports = client;

const { Client } = require("pg");
const client = new Client({
  host: "/var/run/postgresql/",
  database: "biztime",
});
client.connect();
module.exports = client;
