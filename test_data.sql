DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

 
\c biztime_test

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

-- INSERT INTO companies
--   VALUES ('apple_test', 'Apple Computer_test', 'Maker of OSX_test.');
      

-- -- INSERT INTO invoices (comp_code, amt, paid, paid_date)
-- --   VALUES ('apple_test', 100, false, null);
     