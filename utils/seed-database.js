'use strict';

const mongoose = require('mongoose');

//assign through object destructuring; 
//import MONGODB_URI key from obj in config.js
const { MONGODB_URI } = require('../config');
//import Note Schema and Model from note.js
const Note = require('../models/note');
//import array of objects from db/see/notes.json
const seedNotes = require('../db/seed/notes');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });