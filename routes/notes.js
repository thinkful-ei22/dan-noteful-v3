'use strict';

const express = require('express');
//const mongoose = require('mongoose');
const Note = require('../models/note');

const { MONGODB_URI } = require('../config');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm } },
      { content: { $regex: searchTerm } }
    ];
  }

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const noteId = req.params.id;
  return Note.findById(noteId)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  const newNote = {
    title: title,
    content: content
  };

  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  return Note.create(newNote)
    .then(result => {
      if (result) {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content } = req.body;
  const updateObj = {
    title: title,
    content: content
  };
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return Note.findByIdAndUpdate(noteId, { $set: updateObj }, {new: true})
    .then(result => {
      if (result) {
        res.status(200).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const noteId = req.params.id;
  return Note.findByIdAndRemove(noteId)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
