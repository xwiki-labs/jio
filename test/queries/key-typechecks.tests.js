/*jslint indent: 2, maxlen: 90, nomen: true */
/*global define, exports, require, module, jIO, window, test,
  raises, ok, equal, deepEqual, sinon */

// define([module_name], [dependencies], module);
(function (dependencies, module) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    return define(dependencies, module);
  }
  if (typeof exports === 'object') {
    return module(require('jio'));
  }
  module(jIO);
}(['jio', 'qunit'], function (jIO) {
  "use strict";

  module('Key and key_schema objects validation');

  test('Check the parameters passed to exec() and create()', function () {
    try {
      jIO.QueryFactory.create('').exec('gnegne');
      ok(false, 'argument 1 not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "Query().exec(): Argument 1 is not of type 'array'",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create({});
      ok(false, 'argument 1 not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "QueryFactory.create(): Argument 1 is not a search text or a parsable object",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create('').exec([], 1);
      ok(false, 'argument 2 not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "Query().exec(): Optional argument 2 is not of type 'object'",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create({type: 'simple'}, '');
      ok(false, 'key_schema type is not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "SimpleQuery().create(): key_schema is not of type 'object'",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create({type: 'simple'}, {});
      ok(false, 'key_schema.key_set is not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "SimpleQuery().create(): key_schema has no 'key_set' property",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create({
        type: 'simple'
      }, {key_set: {}, foobar: {}});
      ok(false, 'unknown key_schema properties are not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "SimpleQuery().create(): key_schema has unknown property 'foobar'",
         'wrong exception message');
    }

  });


  test('Check the key options', function () {
    var doc_list = [
      {'identifier': 'a'}
    ];

    try {
      jIO.QueryFactory.create({
        type: 'simple',
        key: {},
        value: 'a'
      }).exec(doc_list);
      ok(false, 'key.read_from is not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "Custom key is missing the read_from property",
         'wrong exception message');
    }

    try {
      jIO.QueryFactory.create({
        type: 'simple',
        key: {
          read_from: 'identifier',
          foobar: ''
        },
        value: 'a'
      }).exec(doc_list);
      ok(false, 'unknown key properties are not checked');
    } catch (e) {
      equal(e.name, 'TypeError', 'wrong exception type');
      equal(e.message,
         "Custom key has unknown property 'foobar'",
         'wrong exception message');
    }
  });

}));
