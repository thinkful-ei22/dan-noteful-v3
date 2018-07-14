'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');

const seedTags = require('../db/seed/tags');

const expect = chai.expect;

chai.use(chaiHTTP);

describe('Noteful App Tag Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Tag.insertMany(seedTags);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function(){
    it('should return all existing tags', function(){
      return Promise.all([Tag.find(), chai.request(app).get('/api/tags')])
        .then(([data, result]) => {
          expect(result).to.have.status(200).and.to.be.json;
          expect(result.body).to.be.an('array').that.has.lengthOf(data.length);
        }); 
    });
  });

  describe('GET /api/tags/:id', function () {
    it('should return correct tag', function () {
      let data;
      return Tag.findOne()
        .then(tag => {
          data = tag;
          return chai.request(app)
            .get(`/api/tags/${data.id}`);
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

  describe('POST /api/tags', function () {
    it('should create and return a new tag when provided valid data', function () {

      const newTag = {
        name: 'funny'
      };

      let res;
      return Tag.create(newTag)
        .then(_res => {
          res = _res;
          expect(_res).to.be.an('object').that.includes(newTag);
          return chai.request(app)
            .get(`/api/tags/${_res.id}`);
        })
        .then(result => {
          expect(result).to.have.status(200).and.to.be.json;
          expect(result.body).to.be.an('object');
          expect(result.body.id).to.equal(res.id);
          expect(result.body.name).to.equal(res.name);

        });
    });
  });

  describe('PUT /api/tags/:id', function () {
    it('should update and return the updated tag when provided valid data', function () {
      const tagToUpdate = {
        name: 'memes'
      };

      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(tagToUpdate);
        })
        .then(result => {
          expect(result).to.be.json;
          expect(result.body.name).to.equal('memes');
          expect(result.body.id).to.equal(data.id);
          expect(new Date(result.body.createdAt)).to.eql(data.createdAt);
        });
    });
  });

  describe('DELETE /api/tags/:id', function () {
    it('should delete the correct tag', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/tags/${data.id}`);
        })
        .then(result => {
          expect(result).to.have.status(204);
          return Tag.findById(data.id);
        })
        .then(res => {
          expect(res).to.be.null;
        });
    });
  });

});

