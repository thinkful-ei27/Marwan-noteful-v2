const express = require('express');
const knex = require('../knex');
const router = express.Router();

// GET ALL tags
router.get('/', (req,res,next) => {

    knex
    .select('id','name')
    .from('tags')
    .then(results => {
        res.json(results)
    })
    .catch(err => next(err))
});

// Get by tag by ID

router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    knex
    .select('id','name')
    .from('tags')
    .where('id',id)
    .then(results =>{
        res.json(results[0])
    })
    .catch(err=> next(err))
})


// Update a tag

router.put('/:id', (req, res, next) => {
    const  id  = req.params.id;
  
    const updateObj = {};
    const updateableField = ['name'];
  
    updateableField.forEach(field => {
      if (field in req.body) {
        updateObj[field] = req.body[field];
      }
    });
  
    if (!updateObj.name) {
      const err = new Error('Missing `name` in request body');
      err.status = 400;
      return next(err);
    }

    knex('tags')
    .where('id',id)
    .update(updateObj,'name')
    .then(results => res.json(results[0]))
    .catch(err => next(err));
});

// Post a tag

router.post('/', (req, res, next) =>{
    const {name} = req.body;

    /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});


// Delete

router.delete('/:id',(req,res,next)=>{
    const id = req.params.id;

    knex('tags')
    .where('id',id)
    .del()
    .then(res.sendStatus(204))
    .catch(err=>next(err))
});



module.exports = router;