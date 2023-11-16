// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { createData } = require("../invoices_test_data");
const db = require('../db');
// const config = require('../config');

// before each test, clean out data
beforeEach(createData);

afterAll(async () => {
  await db.end()
})

afterEach(async () => {
    try {
      await db.query('TRUNCATE TABLE invoices RESTART IDENTITY CASCADE');
    } catch (error) {
      console.error('Error cleaning up database:', error.message);
    }
  });



describe("GET /invoices", () => {
  test("Get a list with one invoice", async function () {
      const response = await request(app).get("/invoices");
      expect(response.body).toEqual({
        "invoices": [
          {id: 1, comp_code: "apple_test"},
          {id: 2, comp_code: "apple_test"},
          {id: 3, comp_code: "ibm_test"},
        ]
      });
    })
  
  });

  //How do we know how to format the date below???

  describe("GET /invoices/:id", function () { 
    test("Gets a single invoice by id", async function () {
      const response = await request(app).get("/invoices/1");
      expect(response.body).toEqual(
          {
            "invoice": {
              id: 1,
              amt: 100,
              add_date: '2018-01-01T05:00:00.000Z',
              paid: false,
              paid_date: null,
              company: {
                code: 'apple_test',
                name: 'Apple_test',
                description: 'Maker of OSX.',
              }
            }
          }
      );
    });
  
    test("It should return 404 for no-such-invoice", async function () {
      const response = await request(app).get("/invoices/999");
      expect(response.status).toEqual(404);
    })
  });


  

  describe("POST/invoices",() =>{
    test("Creates a single invocie", async() =>{
      const response = await request(app)
        .post("/invoices")
        .send({amt: 400, comp_code: 'ibm_test'});

    expect(response.body).toEqual(
        {
          "invoice": {
            id: 4,
            comp_code: "ibm_test",
            amt: 400,
            add_date: expect.any(String),
            paid: false,
            paid_date: null,
          }
        }
    );
    })
  })

  //first attempt

  // describe("PUT/:id",() =>{
  //   test("Updates an invoice by id", async() =>{
  //     const res = await request(app).put(`/invoices/${testCompany.code}`).send({name:'PearTest', description:'pear mouse'});
  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toEqual({
  //       company: {
  //             code: 'apple_test',
  //             name: 'PearTest',
  //             description: 'pear mouse'
  //     }
  //     })
  //   })
  // })

  describe("PUT /:id", function () {

    test("Updates an invoice by id", async function () {
      const response = await request(app)
          .put("/invoices/1")
          .send({amt: 1000, paid: false});
  
      expect(response.body).toEqual(
          {
            "invoice": {
              id: 1,
              comp_code: 'apple_test',
              paid: false,
              amt: 1000,
              add_date: expect.any(String),
              paid_date: null,
            }
          }
      );
    });
  
    test("It should return 404 for no-such-invoice", async function () {
      const response = await request(app)
          .put("/invoices/9999")
          .send({amt: 1000});
  
      expect(response.status).toEqual(404);
    });
  
    test("It should return 500 for missing data", async function () {
      const response = await request(app)
          .put("/invoices/1")
          .send({});
  
      expect(response.status).toEqual(500);
    })
  });




  //first attempt:

  // describe("DELETE/companies/:code",() =>{
  //   test("Deletes a single company", async() =>{
  //     const res = await request(app).delete(`/companies/${testInvoice.id}`);
  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toEqual({ status: "Deleted!"})
  //     })
  //   })



  describe("DELETE /", function () {

    test("Deletes a single invoice by id", async function () {
      const response = await request(app)
          .delete("/invoices/1");
  
      expect(response.body).toEqual({"status": "Invoice Deleted!"});
    });
  
    test("It should return 404 for no-such-invoices", async function () {
      const response = await request(app)
          .delete("/invoices/999");
  
      expect(response.status).toEqual(404);
    });
  });