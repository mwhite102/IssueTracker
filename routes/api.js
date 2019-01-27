/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING);

// Create mongoose issue schema
var issueSchema = new mongoose.Schema({
  project: {type: String, required: true},
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String},
  status_text: {type: String},
  created_on: {type: Date, required: true, default: new Date()},
  updated_on: {type: Date, required: true, default: new Date()},
  open: {type: Boolean, required: true, default: true}
});

// Create mongoose issue model
var IssueModel = mongoose.model('IssueModel', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){      
      handleFindIssueRequest(req, res, next)
    })
    
    .post(function (req, res, next){      
      handleNewIssueRequest(req, res, next);
    })
    
    .put(function (req, res, next){      
      handleUpdateIssueRequest(req, res, next);
    })
    
    .delete(function (req, res, next){
      handleDeleteIssueRequest(req, res, next);
    });

    // Request Handlers

    function handleDeleteIssueRequest(req, res, next) {
      var project = req.params.project;
      if(!req.query || !req.query._id) {
        res.send('_id error');
        return
      }
      else {
        deleteIssue(req.query, function(err, data) {
          if (err) {
            res.send(`could not delete ${req.query._id}`);
          }
          else {
            res.send(`deleted ${req.query._id}`);
          }
        });
      }
    }
  
    function handleFindIssueRequest(req, res, next) {
      var project = req.params.project;
      var query = req.query;
      query['project'] = project;
      findIssues(query, function (err, docs) {
        if (err) {
          next (err);
        } else {
          res.json(docs);
        };
      });
    }
    
    function handleNewIssueRequest(req, res, next) {
      // Check for missing required fields
      if (!req.body.issue_title) {
        res.send("Required field title is missing");
        return;
      } 
      if (!req.body.issue_text) {
        res.send("Required field text is missing");
        return;
      }
       
      if (!req.body.created_by) {
        res.send("Required field created by is missing");
        return;
      }

      insertIssue(
        req.params.project,
        req.body.issue_title,
        req.body.issue_text,
        req.body.created_by,
        req.body.assigned_to,
        req.body.status_text,
        function (err, data){
          if (err) {
            next(err);
          }
          else {
            res.json(data);            
          }
        });
    };

    function handleUpdateIssueRequest(req, res, next) {
      // Are there any fields to update?
      if (Object.keys(req.body).length === 0 ) {
        res.send("no updated field sent");
        return;
      }

      var project = req.params.project;
      updateIssue(req.query.id, req.body, function (err, data) {
        if (err) {
          res.send(`could not update ${req.query.id}`);
        }
        else {
          res.send('successfully updated')
        }
      });
    }

    // Database functions

    function deleteIssue(query, callback) {
      IssueModel.deleteOne(query, function (err, data) {
        if (err) return callback(err);
        return callback(null, data);
      });
    }

    function findIssues(query, callback) {
      IssueModel.find(query, function (err, docs) {
        if (err) return callback(err);
        return callback(null, docs);
      });
    }

    function insertIssue(project, title, text, createdBy, assignedTo, statusText, callback) {
      // Create new IssueModel
      var issueModel = new IssueModel({
        project: project,
        issue_title: title,
        issue_text: text,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText        
      });

      // Save to the database
      issueModel.save(function (err, data) {
        if (err) return callback(err);
        return callback(null, data);
      });
    };

    function updateIssue(_id, fields, callback) {
      IssueModel.findOne({_id: _id}, function (err, doc) {
        for (var key in fields) {
          doc[key] = fields[key];
        }
        doc.updated_on = new Date();
        try {
          doc.save();  
        } catch (error) {
          return callback(error);
        }
        callback(null, doc);
      });
    }

};
