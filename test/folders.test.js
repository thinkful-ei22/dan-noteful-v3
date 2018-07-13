'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const seedFolders = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHTTP);

describe('Noteful App Folder Tests', function(){

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/folders', function(){
    it('should return all existing folders', function(){
      return Promise.all([
        Folder.find(),
        chai.request(app)
          .get('/api/folders')
      ])
        .then(([data, result]) => {
          expect(result).to.have.status(200).and.to.be.json;
          expect(result.body).to.be.an('array');
          expect(result.body).to.have.lengthOf(data.length);
        });
    });
  });

  describe('GET /api/folders/:id', function(){
    it('should return correct folder', function(){
      let data;
      return Folder.findOne()
        .then(folder => {
          data = folder;
          return chai.request(app)
            .get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200).and.to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'createdAt', 'updatedAt', 'id');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('POST /api/folders', function(){
    it('should create and return a new folder when provided valid data', function(){
      
      const newFolder = {
        name: 'Misc'
      };

      let res;
      return Folder.create(newFolder)
        .then(_res => {
          res = _res;
          expect(_res).to.be.an('object').that.includes(newFolder);
          return chai.request(app)
            .get(`/api/folders/${_res.id}`);
        })
        .then(result => {
          expect(result).to.have.status(200).and.to.be.json;
          expect(result.body).to.be.an('object');
          expect(result.body.id).to.equal(res.id);
          expect(result.body.name).to.equal(res.name);

        });
    });
  });

  describe('PUT /api/folders/:id', function(){
    it('should update and return the updated folder when provided valid data', function(){
      const folderToUpdate = {
        name: 'Misc'
      };

      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(folderToUpdate);
        })
        .then(result => {
          expect(result).to.be.json;
          expect(result.body.name).to.equal('Misc');
          expect(result.body.id).to.equal(data.id);
          expect(new Date(result.body.createdAt)).to.eql(data.createdAt);
        });
    });
  });

  describe('DELETE /api/folders/:id', function(){
    it('should delete the correct folder', function(){
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/folders/${data.id}`);
        })
        .then(result => {
          expect(result).to.have.status(204);
          return Folder.findById(data.id);
        })
        .then(res => {
          expect(res).to.be.null;
        });
    });
  });
});