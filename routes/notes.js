'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();
const hydrateNotes = require('../utils/hydrateNotes');


// TEMP: Simple In-Memory Database
const data = require('../db/notes');
// const simDB = require('../db/simDB');
const knex = require('../knex');
// const notes = knex.initialize(data);

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  const {folderId} = req.query
  const {tagId} = req.query

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(function (queryBuilder) {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      if (results) {
        const hydrated = hydrateNotes(results);
        res.json(hydrated)
      } else {
        next();
      }
    })
    .catch(err => next(err));

})

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', id)
    .then(results=>{
      if (results) {
      const hydrated = hydrateNotes(results[0]);
      res.json(hydrated)
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    })
});

// Put update an item
router.put('/:id', (req, res, next) => {
      const id = req.params.id;
      const { tags } = req.body;

      /***** Never trust users - validate input *****/
      const updateObj = {};
      const updateableFields = ['title', 'content', 'folder_id'];

      updateableFields.forEach(field => {
        if (field in req.body) {
          updateObj[field] = req.body[field];
        }
      });

      /***** Never trust users - validate input *****/
      if (!updateObj.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
      }

      knex
        .select('id', 'title', 'content')
        .from('notes')
        .where('id', id)
        .update(updateObj, ['id', 'title', 'content'])
        .then(() => {
          knex
            .from('notes_tags')
            .where('note_id', id)
            .del()
        })
        .then(() => {
          // Insert related tags into notes_tags table
          const tagsInsert = tags.map(tagId => ({ note_id: id, tag_id: tagId }));
          return knex.insert(tagsInsert).into('notes_tags');
        })
        .then(() => {
          // Select the new note and leftJoin on folders and tags
          return knex
            .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
            .from('notes')
            .leftJoin('folders', 'notes.folder_id', 'folders.id')
            .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
            .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
            .where('notes.id', id);
        })
        .then(results => {
          // If the result exists
          if (results) {
            // Hydrate the results
            const hydrated = hydrateNotes(results)[0];
            // Respond with a 200 status and a note object
            res.json(hydrated);
          } else {
            // Trigger a 404
            next();
          }
        })
        .catch(err => next(err));
    });

      // Post (insert) an item
      router.post('/', (req, res, next) => {
        const { title, content, folderId, tags } = req.body;

        const newItem = {
          title,
          content,
          folder_id: folderId ? folderId : null
        };
        /***** Never trust users - validate input *****/
        if (!newItem.title) {
          const err = new Error('Missing `title` in request body');
          err.status = 400;
          return next(err);
        }
      
        let noteId;
        // Insert new note into notes table
        knex
          .insert(newItem)
          .into('notes')
          .returning('id')
          .then(([id]) => {
            // Insert related tags into notes_tags table
            noteId = id;
            const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
            return knex.insert(tagsInsert).into('notes_tags');
          })
          .then(() => {
            // Select the new note and leftJoin on folders and tags
            return knex
              .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
              .from('notes')
              .leftJoin('folders', 'notes.folder_id', 'folders.id')
              .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
              .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
              .where('notes.id', noteId);
          })
          .then(results => {
            if (results) {
              // Hydrate the results
              const hydrated = hydrateNotes(results)[0];
              // Respond with a location header, a 201 status and a note object
              res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
            } else {
              next();
            }
          })
          .catch(err => next(err));
      });

            // Delete an item
            router.delete('/:id', (req, res, next) => {
              const id = req.params.id;


              knex
                .select('id', 'title', 'content')
                .from('notes')
                .where('id', id)
                .del()
                .then(result => {
                  res.json(result)
                })
                .catch(err => {
                  next(err)
                })

            });

            module.exports = router;