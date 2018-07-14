'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Note = require('../models/note');

const router = express.Router();

// GET all / tags
router.get('/', (req, res, next) => {
  return Tag.find()
  // Sort the response by name
    .sort('name')
    .then(tags => {
      res.json(tags);
    })
    .catch(err => next(err));
});

// GET / tags by id
router.get('/:id', (req, res, next) => {
  
  const { id } = req.params;

  // Add validation that protects against invalid Mongo ObjectIds and prevents unnecessary database queries.
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `tagId` is not valid');
    err.status = 400;
    return next(err);
  }

  return Tag.findById(id)
    .then(tag => {
    // Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
      if(tag) {
        res.status(200).json(tag);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


// POST / tags to create a new tag
router.post('/', (req, res, next) => {
  
  const { name } = req.body;

  // Add validation that protects against missing name field
  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  // A successful insert returns a location header and a 201 status
  return Tag.create(newTag)
    .then(result => {
      if(result){
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      // Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message
      if(err.code === 11000){
        err = new Error('The tag `name` already exists');
        err.status = 400;
      }
      next(err);
    });
});

// PUT / tags by id to update a tag
router.put('/:id', (req, res, next) => {

  const {id} = req.params;
  const { name } = req.body;

  // Add validation which protects against missing name field
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  // Add validation which protects against an invalid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `tagId` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateData = { name };

  // Ensure you are returning the updated / modified document, not the document prior to the update
  Tag.findByIdAndUpdate(id, updateData, { new: true })
    .then(updatedTag => {
      // Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
      if(updatedTag){
        res.status(200).json(updatedTag);
      } else {
        next();
      }
    })
    .catch(err => {
      // Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message
      if(err.code === 11000) {
        err = new Error('The tag `name` already exists');
        err.status = 400;
      }
      next(err);
    });
});

// DELETE / tags by id deletes the tag AND removes it from the notes collection
router.delete('/:id', (req, res, next) => {

  const { id } = req.params;

  // Remove the tag
  const deleteTagPromise = Tag.findByIdAndRemove(id);

  // Using $pull, remove the tag from the tags array in the notes collection.
  const removeTagsFromNotePromise = Note.updateMany({ tags: id }, { $pull: { tags: id } });

  Promise.all([deleteTagPromise, removeTagsFromNotePromise]) 
    .then(([promiseResult]) => {
      // Add condition that checks the result and returns a 200 response with the result or a 204 status
      if(promiseResult) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

module.exports = router;