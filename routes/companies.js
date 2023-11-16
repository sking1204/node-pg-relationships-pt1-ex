const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')



router.get('/', async (req,res, next) =>{
    try{
    const results = await db.query(`SELECT * FROM companies`); 
    return res.json({companies:results.rows})
    } catch (e) {
      return next(e)
    }
  })

  //ROUTE BEFORE FURTHER STUDY

// router.get('/:code', async (req, res, next) => {
//   try {
//     const { code } = req.params;
//     const results = await db.query('SELECT * FROM companies WHERE code = $1', [code])
//     if (results.rows.length === 0) {
//       throw new ExpressError(`Can't find company with code of ${code}`, 404)
//     }
//     return res.send({ company: results.rows[0] })
//   } catch (e) {
//     return next(e)
//   }
// })  

//FURTHER STUDY ROUTE:

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Get company information
    const companyQuery = 'SELECT * FROM companies WHERE code = $1';
    const companyResult = await db.query(companyQuery, [code]);

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    const company = companyResult.rows[0];

    // Get associated industries for the company
    const industriesQuery = `
      SELECT i.industry
      FROM industries AS i
      INNER JOIN industries_companies ic ON i.code = ic.industries_code
      WHERE ic.companies_code = $1
    `;

    const industriesResult = await db.query(industriesQuery, [code]);
    const industries = industriesResult.rows.map(row => row.industry);

    // Add industries to the company information
    company.industries = industries;

    return res.send({ company });
  } catch (e) {
    return next(e);
  }
});





// POST route to add an industry to a company

router.post("/:code/industries", async function (req, res, next) {
  try {
    const { code } = req.params;
    const { industry } = req.body;

    // Check if the company with the given code exists
    const checkCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

    if (checkCompany.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    // Check if the industry already exists
    const checkIndustry = await db.query('SELECT * FROM industries WHERE industry = $1', [industry]);

    let industryCode;

    if (checkIndustry.rows.length === 0) {
      // If the industry doesn't exist, create it
      industryCode = slugify(industry, { lower: true });

      await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2)', [industryCode, industry]);
    } else {
      // If the industry already exists, use its code
      industryCode = checkIndustry.rows[0].code;
    }

    // Link the company to the industry
    await db.query('INSERT INTO industries_companies (industries_code, companies_code) VALUES ($1, $2)', [industryCode, code]);

    return res.status(201).json({ status: "Industry added successfully" });
  } catch (err) {
    return next(err);
  }
});

// GET route to retrieve industries related to a company
// router.get("/:code/industries", async function (req, res, next) {
//   try {
//     const { code } = req.params;

//     // Check if the company with the given code exists
//     const checkCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

//     if (checkCompany.rows.length === 0) {
//       throw new ExpressError(`Can't find company with code of ${code}`, 404);
//     }

//     // Retrieve industries related to the company
//     const industriesQuery = await db.query('SELECT industries.industry FROM industries_companies JOIN industries ON industries_companies.industries_code = industries.code WHERE companies_code = $1', [code]);

//     const industries = industriesQuery.rows.map(row => row.industry);

//     return res.json({ industries });
//   } catch (err) {
//     return next(err);
//   }
// });

// GET route to retrieve industries related to a company
// router.get("/:code/industries", async function (req, res, next) {
//   try {
//     const { code } = req.params;

//     // Check if the company with the given code exists
//     const checkCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

//     if (checkCompany.rows.length === 0) {
//       throw new ExpressError(`Can't find company with code of ${code}`, 404);
//     }

//     // Retrieve industries and associated company codes related to the company
//     const industriesQuery = await db.query(`
//       SELECT industries.industry, industries_companies.companies_code
//       FROM industries_companies
//       JOIN industries ON industries_companies.industries_code = industries.code
//       WHERE industries_companies.companies_code = $1
//     `, [code]);

//     const result = industriesQuery.rows.map(row => ({
//       industry: row.industry,
//       companyCode: row.companies_code
//     }));

//     return res.json({ industries: result });
//   } catch (err) {
//     return next(err);
//   }
// });



// GET route to retrieve industry codes and names related to a company
router.get("/:code/industries", async function (req, res, next) {
  try {
    const { code } = req.params;

    // Check if the company with the given code exists
    const checkCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

    if (checkCompany.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    // Retrieve industry codes and names related to the company
    const industriesQuery = await db.query(`
      SELECT industries.code, industries.industry
      FROM industries_companies
      JOIN industries ON industries_companies.industries_code = industries.code
      WHERE industries_companies.companies_code = $1
    `, [code]);

    const result = industriesQuery.rows.map(row => ({
      code: row.code,
      industry: row.industry
    }));

    return res.json({ industries: result });
  } catch (err) {
    return next(err);
  }
});





router.post("/", async function (req, res, next) {
    try {
      let {name, description} = req.body;
      let code = slugify(name,{lower:true});
     
  
      const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3) 
             RETURNING code, name, description`,[code, name, description]);
  
      return res.status(201).json({company: result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
  });




router.put('/:code', async (req, res, next) => {
    try {
      const code = req.params.code;
      const { name, description } = req.body; // Update with your company fields
  
      // Check if the company with the given code exists
      const checkCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);
  
      if (checkCompany.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404);
      }
  
      // Update the company in the database
      const result = await db.query(
        'UPDATE companies SET name =$1, description =$2 WHERE code =$3 RETURNING code, name, description',
        [name, description, code]
      );
  
      return res.send({company: result.rows[0] });
    } catch (e) {
      return next(e);
    }
  });


  router.delete('/:code', async (req, res, next) => {
    try {
        let code = req.params.code
        const result = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code',[code]); 

        if (result.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404);
      } else{
        return res.json({status: "Deleted!" });
      }               
          
    } catch (e) {
      return next(e);
    }
  });







module.exports = router;