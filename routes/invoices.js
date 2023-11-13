const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");



router.get('/', async (req,res, next) =>{
    try{
    const results = await db.query(`SELECT * FROM invoices`); 
    return res.json({invoices:results.rows})
    } catch (e) {
      return next(e)
    }
  })

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query('SELECT * FROM invoices WHERE id = $1', [id])
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    }
    return res.send({ invoice: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

//adds an invoice

router.post("/", async function (req, res, next) {
    try {
      let {comp_code, amt} = req.body;
     
  
      const result = await db.query(
            `INSERT INTO invoices (comp_code, amt ) 
             VALUES ($1, $2) 
             RETURNING comp_code, amt`,[comp_code, amt]);
  
      return res.status(201).json({invoice: result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
  });


//update invoice by id

router.put('/:id', async (req, res, next) => {
    try {
      const id = req.params.id;
      const { amt } = req.body; // Update with your company fields
  
      // Check if the company with the given code exists
      const checkInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
  
      if (checkInvoice.rows.length === 0) {
        throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
      }
  
      // Update the company in the database
      const result = await db.query(
        'UPDATE invoices SET amt =$1 WHERE id =$2 RETURNING amt id',
        [amt,id]
      );
  
      return res.send({invoice: result.rows[0] });
    } catch (e) {
      return next(e);
    }
  });


  router.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id
        const result = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id',[id]); 

        if (result.rows.length === 0) {
        throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
      } else{
        return res.json({status: "Invoice Deleted!" });
      }               
          
    } catch (e) {
      return next(e);
    }
  });







module.exports = router;