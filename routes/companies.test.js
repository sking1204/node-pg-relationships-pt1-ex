// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
// const config = require('../config');

let testCompany;
beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('apple_test', 'Apple Computer_test', 'Maker of OSX_test.')
        RETURNING  code, name, description`);
    testCompany = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
  await db.end()
})

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] })
  })
})

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
      const res = await request(app).get(`/companies/${testCompany.code}`)
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ company:testCompany})
  
      
    })
    test("Responds with 404 for invalid code", async () => {
      const res = await request(app).get(`/companies/0`)
      expect(res.statusCode).toBe(404);
       
    })
  })

  describe("POST/companies",() =>{
    test("Creates a single company", async() =>{
      const res = await request(app).post('/companies').send({code: 'plumtest',name:'PlumTest', description:'plum monitors'});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        company: {
              code: 'plumtest',
              name: 'PlumTest',
              description: 'plum monitors'
      }
      })
    })
  })

  describe("PUT/companies",() =>{
    test("Updates a single company", async() =>{
      const res = await request(app).put(`/companies/${testCompany.code}`).send({name:'PearTest', description:'pear mouse'});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        company: {
              code: 'apple_test',
              name: 'PearTest',
              description: 'pear mouse'
      }
      })
    })
  })

  describe("DELETE/companies/:code",() =>{
    test("Deletes a single company", async() =>{
      const res = await request(app).delete(`/companies/${testCompany.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: "Deleted!"})
      })
    })

