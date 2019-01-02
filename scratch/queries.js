'use strict';

const knex = require('../knex');

let searchTerm = 'gaga';
knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });


  const id = 1001;
  knex
  .select('notes.id','title','content')
  .from('notes')
  .where('notes.id', id)
  .then(result=>{
    console.log(JSON.stringify(result[0]))
  })
  .catch(err=>{
    console.error(err);
  });

  // Update
  
  knex
  .select('notes.id','title','content')
  .from('notes')
  .where('notes.id',id)
  .update({
    'title': 'Why I prefer dogs over cats',
    'content': 'lorem nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus'
  },['id','title','content'])
  .then(results=>{
    console.log(JSON.stringify(results[0]))
  })
  .catch(err=>{
    console.error(err)
  })

  // Create
  knex
  .insert({
    title: 'new title',
    content: 'new content'
  },['id','title','content'])
  .into('notes')
  .then(results=>{
    console.log(results[0])}
  )
  .catch(err=>{
    console.error(err)
  })

  // Delete
  const delId = 1009;
  
  knex
  .select('notes.id','title','content')
  .from('notes')
  .where('notes.id',delId)
  .del()
  .then(result=>{
    console.log(result)
  })
  .catch(err=>{
    console.error(err)
  })
  