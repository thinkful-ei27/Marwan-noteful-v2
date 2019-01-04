const express = require('express');
const knex = require('../knex');
const router = express.Router();


// Get all folders
router.get('/folders', (req,res,next)=>{
    knex.select('id','name')
    .from('folders')
    .then(results=>{
        res.json(results);
    })
    .catch(err=>next(err))
});



// Get folder by ID

router.get('/folders/:id',(req,res,next) =>{
    const id = req.params.id;

    knex.select('id','name')
    .from('folders')
    .where('id',id)
    .then(results=>{
        res.json(results[0])
    })
    .catch(err=> next(err))
});

// Update folder

router.put('/folders/:id', (req, res, next) => {
    const { id } = req.params;
  
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

    knex('folders')
    .where('id',id)
    .update(updateObj,'name')
    .then(results => res.json(results[0]))
    .catch(err => next(err));
});

// Create a folder

router.post('/folders', (req, res, next) => {
    const { name } = req.body;
  
    const newItem = { name };
    /***** Never trust users - validate input *****/
    if (!newItem.title) {
      const err = new Error('Missing `title` in request body');
      err.status = 400;
      return next(err);
    }
  
    knex
    .insert(newItem,['name'])
    .into('folders')
    .then(results=>{
      res.json(results[0])}
    )
    .catch(err=>{
      next(err)
    })
  });

// Delete a folder

router.delete('/folders/:id',(req,res,next)=>{
const id = req.params.id

knex
.select('id','name')
.from('folders')
.where('id',id)
.del()
.then(res.sendStatus(204))
.catch(err=> next(err))
});

module.exports = router;
  