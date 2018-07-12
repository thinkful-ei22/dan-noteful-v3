'use strict';

const mongoose = require('mongoose');

//assign through object destructuring; 
//import MONGODB_URI key from obj in config.js
const { MONGODB_URI } = require('../config');
//import Note Schema and Model from note.js
const Note = require('../models/note');
//import Folder model
const Folder = require('../models/folder');
//import array of objects from db/see/notes.json
const seedNotes = require('../db/seed/notes');
//import array of folder objects
const seedFolders = require('../db/seed/folders');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Folder.createIndexes()
    ]);
  })
  .then(results => {
    console.info(`completed all ${results.length} tasks`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });

//seeding mlab db
//export MONGODB_URI = mongodb://dcs:pw@ds233551.mlab.com:33551/dans-notes-db