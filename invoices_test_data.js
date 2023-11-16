/** code common to tests. */

const db = require("./db");


async function createData() {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies (code, name, description)
                    VALUES ('apple_test', 'Apple_test', 'Maker of OSX.'),
                           ('ibm_test', 'IBM_test', 'Big blue.')`);

  const inv = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
           VALUES ('apple_test', 100, false, '2018-01-01', null),
                  ('apple_test', 200, true, '2018-02-01', '2018-02-02'), 
                  ('ibm_test', 300, false, '2018-03-01', null)
           RETURNING id`);
}


module.exports = { createData };
