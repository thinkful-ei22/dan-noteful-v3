'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHTTP);

describe('Noteful App Note Tests', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all(
      [
        Note.insertMany(seedNotes), 
        Folder.insertMany(seedFolders)
      ]
    );
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  
  // Parallel Request - Call both DB and API, then compare:

  // Call the database and the API
  // Wait for both promises to resolve using Promise.all
  // then compare database results to API response
  // The advantage of this approach is that both responses are available in the same scope, so you do not need to set a variable at a higher scope.But this only works with GET endpoints because there are no DB changes performed.

  describe('GET /api/notes', function() {
    it('should return all existing notes', function(){
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  
  // Serial Request - Call DB then call API then compare:

  // First, call the database to get an ID
  // then call the API with the ID
  // then compare database results to API response
  describe('GET /api/notes/:id', function(){
    it('should return correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;

          // 2) then call the API with the ID
          return chai.request(app)
            .get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'folderId', 'title', 'content', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  // Serial Request - Call API then call DB then compare:

  // First, call the API to insert the document
  // then call the database to retrieve the new document
  // then compare the API response to the database results
  // Notice you need to set the res.body to body declared at a higher scope so that the next.then() has access to the value.

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'folderId': '111111111111111111111100'
      };

      let res;

      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'folderId', 'title', 'content', 'createdAt', 'updatedAt');

          // 2) then call the database
          return Note.findById(res.body.id);
        })

      // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });


  describe('PUT /api/notes/:id', function(){
    it('should update and return the update note when provided valid data', function(){
      const noteToUpdate = {
        title: 'Lady Gaga likes singing with cats',
        content: 'To show her genuine affection to cats, Lady Gaga performed in a feline choir...',
        folderId: '111111111111111111111102'
      };
      let note;
      let result;

      return Note.findOne()
        .then(_note => {
          note = _note;
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .send(noteToUpdate)
            .then(_result => {
              result = _result;
              expect(_result).to.have.status(200).and.to.be.json;
              expect(_result.body).to.be.an('object');
              expect(_result.body).to.include.keys('id', 'folderId', 'title', 'content', 'createdAt', 'updatedAt');
              return Note.findById(note.id);
            })
            .then(updatedNote => {
              expect(updatedNote.title).to.equal(noteToUpdate.title);
              expect(updatedNote.content).to.equal(noteToUpdate.content);
              expect(new Date(result.body.createdAt)).to.eql(updatedNote.createdAt);
            });
        });

    });
  });

  describe('DELETE /api/notes/:id', function(){
    it('should delete the correct note', function(){
      let note;

      return Note.findOne()
        .then(_note => {
          note = _note;
          return chai.request(app)
            .delete(`/api/notes/${note.id}`);
        })
        .then(result => {
          expect(result).to.have.status(204);
          return Note.findById(note.id);
        })
        .then(_note => {
          expect(_note).to.be.null;
        });
    });
  });
});