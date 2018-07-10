'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//Find/Search for notes using Note.find
mongoose.connect(MONGODB_URI)
  .then(() => {
    const searchTerm = 'Lady Gaga';
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm };
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Find note by id using Note.findById
mongoose.connect(MONGODB_URI)
  .then(() => {
    const noteId = '000000000000000000000000';
    return Note.findById(noteId);
  })
  .then(result => {
    console.log(result);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Create a new note using Note.create
mongoose.connect(MONGODB_URI)
  .then(() => {
    const newNote = {
      title: 'Lady Gaga hates cats',
      content: 'This is my new note about Lady Gaga'
    };
    if(!newNote.title){
      const message = 'Missing title in request body';
      console.error(message);
    }
    return Note.create(newNote);
  })
  .then(result => {
    console.log(result);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Update a note by id using Note.findByIdAndUpdate
mongoose.connect(MONGODB_URI)
  .then(() => {
    const noteId = '5b450d759ce4623bc9935c0d';
    const updateObj = {
      title: 'Lady Gaga hates cats',
      content: 'This headline is misleading! Lady Gaga can\'t imagine her life without cats!!!'  
    }
    return Note.findByIdAndUpdate(noteId, {$set : updateObj})
      .then(note => {
        console.log(note);
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  });

//Delete a note by id using Note.findByIdAndRemove
mongoose.connect(MONGODB_URI)
  .then(() => {
    const noteId = '000000000000000000000000';
    return Note.findByIdAndRemove(noteId)
      .then(() => {
        const message = `Note id: ${noteId} successfully deleted!`
        console.log(message);
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        console.error(err);
      });
  });