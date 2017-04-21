'use strict';

var os = require('os');
var path = require('path');
var chalk = require('chalk');
var shortid = require('shortid');
var createStore = require('json-fs-store');

var identity = function identity(x) {
  return x;
};
var isObject = function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

var fail = function fail() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  method = args[0];
  err = args[1];
  id = args[2];


  return console.log(chalk.red('FAIL:'), '#' + method + ' ' + JSON.stringify(id, 2, 2) + '\n', chalk.gray(err));
};
module.exports = function (type) {
  var store = createStore(path.join(os.tmpdir(), type));

  var get = function get(id) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        fail('get', err);
        reject(err);
        return;
      }

      store.load(id, function (err, obj) {
        if (err) {
          fail('get', err, id);
          reject(err);
          return;
        }

        resolve(obj);
      });
    });
  };

  var query = function query() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : identity;
    return new Promise(function (resolve, reject) {
      store.list(function (err, objs) {
        if (err) {
          fail('query', err, id);
          reject(err);
          return;
        }

        var result = objs.filter(fn).sort(function (a, b) {
          return a.createdAt >= b.createdAt;
        });

        resolve(result);
      });
    });
  };

  var create = function create(obj) {
    return new Promise(function (resolve, reject) {
      if (obj === undefined) {
        obj = {};
      }

      if (obj.id) {
        var _err = new Error('Create does not accept object with an id.');
        fail('create', _err, obj);
        reject(_err);
        return;
      }

      if (!isObject(obj)) {
        var _err2 = new Error('Malformed object');
        fail('create', _err2, obj);
        reject(_err2);
        return;
      }

      var id = shortid();
      var createdAt = Date.now();
      var updatedAt = createdAt;
      var next = Object.assign({}, obj, { id: id, createdAt: createdAt, updatedAt: updatedAt });

      store.add(next, function (err) {
        if (err) {
          fail('create', err, next);
          reject(err);
          return;
        }

        resolve(next);
      });
    });
  };

  var update = function update(fields) {
    return new Promise(function (resolve, reject) {
      if (!fields.id) {
        var _err3 = new Error('Update requires object with id.');
        fail('update', _err3);
        reject(_err3);
        return;
      }

      if (!isObject(fields)) {
        var _err4 = new Error('Malformed object.');
        fail('uppdate', fields, _err4);
        reject(_err4);
        return;
      }

      store.load(fields.id, function (err, obj) {
        if (err) {
          fail('update', fields.id, err);
          reject(err);
          return;
        }

        var createdAt = obj.createdAt;
        var updatedAt = Date.now();

        var next = Object.assign({}, obj, fields, { createdAt: createdAt, updatedAt: updatedAt });

        store.add(next, function (err) {
          if (err) {
            fail('create', err, next);
            reject(err);
            return;
          }

          resolve(next);
        });
      });
    });
  };

  var remove_ = function remove_(id) {
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'remove';
    return new Promise(function (resolve, reject) {
      store.remove(id, function (err, obj) {
        if (err) {
          fail(method, err, id);
          reject(err);
          return;
        }

        resolve({ id: id });
      });
    });
  };

  var remove = function remove(id) {
    return remove_(id);
  };

  var clean = function clean() {
    return new Promise(function (resolve, reject) {
      store.list(function (err, objs) {
        var proms = objs.map(function (obj) {
          return remove_(obj.id, 'clean');
        });
        Promise.all(proms).then(resolve, reject);
      });
    });
  };

  return { clean: clean, create: create, get: get, query: query, remove: remove, update: update };
};
