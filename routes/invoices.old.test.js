// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
// const config = require('../config');

let testInvoice;
beforeEach(async () => {
    await request(app)
    .post('/companies')
    .send({
      code: 'apple_test',
      name: 'Apple Computer_test',
      description: 'Maker of OSX_test.'
    });

  // Create an invoice
  const invoiceResponse = await request(app)
    .post('/invoices')
    .send({
      comp_code: 'apple_test',
      amt: 100
      
    });
    
})

afterEach(async () => {
    try {
      await db.query('TRUNCATE TABLE invoices RESTART IDENTITY CASCADE');
    } catch (error) {
      console.error('Error cleaning up database:', error.message);
    }
  });



describe("GET /invoices", () => {
  test("Get a list with one invoice", async () => {
    const res = await request(app).get('/invoices')
    
    expect(res.body).toEqual({ invoices: [
        {id: 1, comp_code:"apple_test"} 
    ] })
  })
})


//first attempt:


// describe("GET /invoices/:id", () => {
//     test("Gets a single invoice by id", async () => {
//       const res = await request(app).get(`/invoices/1`)
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toEqual({ invoice:res.rows})
  
      
//     })
//     test("Responds with 404 for invalid code", async () => {
//       const res = await request(app).get(`/invoices/0`)
//       expect(res.statusCode).toBe(404);
       
//     })
//   })

  //second attempt:

  describe("GET /invoices/:id", () => {
    test("It return invoice info", async function () {
        const response = await request(app).get("/invoices/1");
        expect(response.body).toEqual(
            {
                invoice: {
                id: 1,
                amt: 100,
                add_date: '2018-01-01T08:00:00.000Z',
                paid: false,
                paid_date: null,
                company: {
                  code: 'apple',
                  name: 'Apple',
                  description: 'Maker of OSX.',
                }
              }
            }
        );
      });
  })

  

//   describe("POST/companies",() =>{
//     test("Creates a single company", async() =>{
//       const res = await request(app).post('/companies').send({code: 'plumtest',name:'PlumTest', description:'plum monitors'});
//       expect(res.statusCode).toBe(201);
//       expect(res.body).toEqual({
//         company: {
//               code: 'plumtest',
//               name: 'PlumTest',
//               description: 'plum monitors'
//       }
//       })
//     })
//   })

//   describe("PUT/companies",() =>{
//     test("Updates a single company", async() =>{
//       const res = await request(app).put(`/companies/${testCompany.code}`).send({name:'PearTest', description:'pear mouse'});
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toEqual({
//         company: {
//               code: 'apple_test',
//               name: 'PearTest',
//               description: 'pear mouse'
//       }
//       })
//     })
//   })

//   describe("DELETE/companies/:code",() =>{
//     test("Deletes a single company", async() =>{
//       const res = await request(app).delete(`/companies/${testCompany.code}`);
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toEqual({ status: "Deleted!"})
//       })
//     })

