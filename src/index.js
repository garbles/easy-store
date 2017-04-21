const os = require('os');
const path = require('path');
const chalk = require('chalk');
const shortid = require('shortid');
const createStore = require('json-fs-store');

const identity = x => x;
const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

const fail = (...args) => {
  [method, err, id] = args;

  return console.log(
    chalk.red('FAIL:'),
    `#${method} ${JSON.stringify(id, 2, 2)}\n`,
    chalk.gray(err)
  );
};
module.exports = type => {
  const store = createStore(path.join(os.tmpdir(), type));

  const get = id =>
    new Promise((resolve, reject) => {
      if (!id) {
        fail('get', err)
        reject(err);
        return;
      }

      store.load(id, (err, obj) => {
        if (err) {
          fail('get', err, id);
          reject(err);
          return;
        }

        resolve(obj);
      });
    });

  const query = (fn = identity) =>
    new Promise((resolve, reject) => {
      store.list((err, objs) => {
        if (err) {
          fail('query', err, id);
          reject(err);
          return;
        }

        const result = objs
          .filter(fn)
          .sort((a, b) => a.createdAt >= b.createdAt);

        resolve(result);
      });
    });

  const create = obj =>
    new Promise((resolve, reject) => {
      if (obj === undefined) {
        obj = {};
      }

      if (obj.id) {
        const err = new Error('Create does not accept object with an id.');
        fail('create', err, obj);
        reject(err);
        return;
      }

      if (!isObject(obj)) {
        const err = new Error('Malformed object');
        fail('create', err, obj);
        reject(err);
        return
      }

      const id = shortid();
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const next = Object.assign({}, obj, {id, createdAt, updatedAt});

      store.add(next, err => {
        if (err) {
          fail('create', err, next);
          reject(err);
          return;
        }

        resolve(next);
      });
    });

  const update = fields =>
    new Promise((resolve, reject) => {
      if (!fields.id) {
        const err = new Error('Update requires object with id.');
        fail('update', err);
        reject(err);
        return;
      }

      if (!isObject(fields)) {
        const err = new Error('Malformed object.');
        fail('uppdate', fields, err);
        reject(err);
        return;
      }

      store.load(fields.id, (err, obj) => {
        if (err) {
          fail('update', fields.id, err);
          reject(err);
          return;
        }

        const createdAt = obj.createdAt;
        const updatedAt = Date.now();

        const next = Object.assign({}, obj, fields, {createdAt, updatedAt});

        store.add(next, err => {
          if (err) {
            fail('create', err, next);
            reject(err);
            return;
          }

          resolve(next);
        });
      });
    });

  const remove_ = (id, method = 'remove') =>
    new Promise((resolve, reject) => {
      store.remove(id, (err, obj) => {
        if (err) {
          fail(method, err, id);
          reject(err);
          return;
        }

        resolve({id});
      });
    });

  const remove = id => remove_(id);

  const clean = () =>
    new Promise((resolve, reject) => {
      store.list((err, objs) => {
        const proms = objs.map(obj => remove_(obj.id, 'clean'));
        Promise.all(proms).then(resolve, reject);
      });
    });

  return {clean, create, get, query, remove, update};
};
