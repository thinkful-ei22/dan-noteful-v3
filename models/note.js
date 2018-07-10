'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

//PRO TIP - toObject transform
//get rid of _v and _id when converting
//from mongoose doc to standard json

noteSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Note', noteSchema);