'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');

const { MONGODB_URI } = require('../config');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const { searchTerm } = req.query;
      let filter = {};

      if (searchTerm) {
        filter.$or = [
          { title: { $regex: searchTerm } },
          { content: { $regex: searchTerm } }
        ];
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;
      return Note.findById(id);
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;