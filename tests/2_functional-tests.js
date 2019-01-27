/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

// We'll need some id's later so declare them
var idForSearch;
var idToDelete;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isDefined(res.body._id);          
          assert.isNotNull(res.body._id);

          // Store it for later to be used to search on
          idForSearch = res.body._id;

          assert.isDefined(res.body.issue_title);
          assert.equal(res.body.issue_title, 'Title');

          assert.isDefined(res.body.issue_text);
          assert.equal(res.body.issue_text, 'text');

          assert.isDefined(res.body.created_by);
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');

          assert.isDefined(res.body.assigned_to);
          assert.equal(res.body.assigned_to, 'Chai and Mocha');

          assert.isDefined(res.body.status_text);
          assert.equal(res.body.status_text, 'In QA');

          assert.isDefined(res.body.open);
          assert.isBoolean(res.body.open);

          assert.isDefined(res.body.created_on);
          assert.isNotNull(res.body.created_on);

          assert.isDefined(res.body.updated_on);
          assert.isNotNull(res.body.updated_on);
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'The Title',
          issue_text: 'Issue Text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id);

          // Store this one for the delete test at the end
          idToDelete = res.body._id

          assert.equal(res.body.issue_title, 'The Title');
          assert.equal(res.body.issue_text, 'Issue Text');
          assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
          assert.isBoolean(res.body.open);
          assert.isNotNull(res.body.created_on);
          assert.isNotNull(res.body.updated_on);
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'The Title',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Required field text is missing");
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send()
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "no updated field sent");
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put(`/api/issues/test?id=${idForSearch}`)
        .send({issue_text: 'new updated text'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put(`/api/issues/test?id=${idForSearch}`)
        .send({
          issue_text: 'more updated text',
          issue_title: 'new title'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({_id: idForSearch})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          _id: idForSearch,
          open: true
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .query({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
      });

      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .query({_id: idToDelete})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `deleted ${idToDelete}`);
            done();
          });
      });
      
    });

});
