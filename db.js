/** Database setup for BizTime. */

// const { Client } = require("pg");

// const client = new Client({
//   connectionString: "postgresql:///biztime"
// });

// client.connect();


// module.exports = client;

//development:

const { Client } = require("pg");
const client = new Client({
  host: "/var/run/postgresql/",
  database: "biztime",
});
client.connect();
module.exports = client;


//test:

// const { Client } = require("pg");
// const client = new Client({
//   host: "/var/run/postgresql/",
//   database: "biztime_test",
// });
// client.connect();
// module.exports = client;

