'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Folder = require('../models/folder');

const router = express.Router();

// GET all / folders
router.get('/', (req, res, next) => {
  // Sort by name
  return Folder.find().sort({ name: 'asc' })
    .then(folders => {
      res.json(folders);
    })
    .catch(err=>next(err));
});

// GET / folders by id
router.get('/:id', (req, res, next) => {
  
  const { id } = req.params;

  // Validate the id is a Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  // Conditionally return a 200 response or a 404 Not Found
  return Folder.findById(id)
    .then(folder => {
      if (folder) {
        res.status(200).json(folder);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// POST / folders to create a new folder
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newFolder = {
    name: name
  };

  // Validate the incoming body has a name field
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  return Folder.create(newFolder)
    .then(result => {
      if (result){
      // Respond with a 201 status and location header
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      // Catch duplicate key error code 11000
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

//   PUT / folders by id to update a folder name
router.put('/:id', (req, res, next) => {
  
  const { id } = req.params;
  const { name } = req.body;

  const updatedFolder = {
    name: name
  };

  // Validate the id is a Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // Validate the incoming body has a name field
  if (!updatedFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  return Folder.findByIdAndUpdate(id, updatedFolder, {new: true})
    .then(result => {
      if (result) {
        res.status(200).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
    // Catch duplicate key error code 11000
      if (err.code === '11100') {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


// DELETE / folders by id which deletes the folder AND the related notes
router.delete('/:id', (req, res, next) => {
  
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Folder.findByIdAndRemove(id)
    .then(() => {
      // Respond with a 204 status
      res.sendStatus(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;
