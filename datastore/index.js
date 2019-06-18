const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
// var fileNames = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var filePath = exports.dataDir + '/' + id + '.txt';
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  var readFileAsync = Promise.promisify(fs.readFile);

  fs.readdir(exports.dataDir, (err, fileNames) => {
    var data = _.map(fileNames, (id) => {
      return readFileAsync(exports.dataDir + '/' + id)
        .then((text) => {
          id = id.split('.')[0];
          return { id, text: text.toString() };
        });
    });
    Promise.all(data) // this returns todo1, todo2
      .then(function (value) {
        callback(null, value);
      });
  });

};

exports.readOne = (id, callback) => {
  const filePath = exports.dataDir + '/' + id + '.txt';
  fs.readFile(filePath, (err, text) => {
    if (!text) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      text = text.toString();
      callback(null, { id, text });
    }
  });

};

exports.update = (id, text, callback) => {
  const filePath = exports.dataDir + '/' + id + '.txt';
  fs.access(filePath, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  const filePath = exports.dataDir + '/' + id + '.txt';
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
