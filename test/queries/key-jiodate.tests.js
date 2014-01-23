/*jslint indent: 2, maxlen: 120, nomen: true, vars: true */
/*global define, exports, require, module, complex_queries, jiodate, window, test, ok,
  equal, deepEqual, sinon, start, stop, RSVP */

// define([module_name], [dependencies], module);
(function (dependencies, module) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    return define(dependencies, module);
  }
  if (typeof exports === 'object') {
    return module(require('complex_queries'), require('jiodate'));
  }
  module(complex_queries, jiodate);
}(['complex_queries', 'jiodate', 'qunit'], function (complex_queries, jiodate) {
  "use strict";

  module('Custom Key Queries with JIODate');

  var noop = function () {
    return; // use with RSVP.all
  };

  test('Stock comparison operators with year precision', function () {
    var docList = function () {
      return [
        {'identifier': 'twenty ten', 'date': '2010-03-04T08:52:13.746Z'},
        {'identifier': 'twenty eleven', 'date': '2011-03-04T08:52:13.746Z'},
        {'identifier': 'twenty twelve', 'date': '2012-03-04T08:52:13.746Z'}
      ];
    }, key_schema = {
      key_set: {
        date: {
          read_from: 'date',
          cast_to: jiodate.JIODate
        }
      }
    }, query_list = [], promise = [];

    stop();

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2011-03-04T08:52:13.746Z', 'identifier': 'twenty eleven'}
          ], 'Match with "date = 2011" (query tree form)');
        })
    );

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        operator: '!=',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2010-03-04T08:52:13.746Z', 'identifier': 'twenty ten'},
            {'date': '2012-03-04T08:52:13.746Z', 'identifier': 'twenty twelve'}
          ], 'Match with "date != 2011" (query tree form)');
        })
    );

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        operator: '<',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2010-03-04T08:52:13.746Z', 'identifier': 'twenty ten'}
          ], 'Match with "date < 2011" (query tree form)');
        })
    );

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        operator: '<=',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2010-03-04T08:52:13.746Z', 'identifier': 'twenty ten'},
            {'date': '2011-03-04T08:52:13.746Z', 'identifier': 'twenty eleven'}
          ], 'Match with "date <= 2011" (query tree form)');
        })
    );

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        operator: '>',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2012-03-04T08:52:13.746Z', 'identifier': 'twenty twelve'}
          ], 'Match with "date > 2011" (query tree form)');
        })
    );

    promise.push(
      complex_queries.QueryFactory.create({
        type: 'simple',
        key: 'date',
        operator: '>=',
        value: '2011'
      }, key_schema).
        exec(docList()).
        then(function (dl) {
          deepEqual(dl, [
            {'date': '2011-03-04T08:52:13.746Z', 'identifier': 'twenty eleven'},
            {'date': '2012-03-04T08:52:13.746Z', 'identifier': 'twenty twelve'}
          ], 'Match with "date >= 2011" (query tree form)');
        })
    );

    query_list = [
      [
        'date: < "2011" OR date: "2012-03"',
        [
          {'date': '2010-03-04T08:52:13.746Z', 'identifier': 'twenty ten'},
          {'date': '2012-03-04T08:52:13.746Z', 'identifier': 'twenty twelve'}
        ]
      ],
      [
        'date: >= "2011-01" AND date: != "2012-03-04T08:52:13.746Z"',
        [
          {'date': '2011-03-04T08:52:13.746Z', 'identifier': 'twenty eleven'}
        ]
      ]
    ];

    query_list.forEach(function (o) {
      var qs = o[0], expected = o[1];
      promise.push(
        complex_queries.QueryFactory.create(qs, key_schema).
          exec(docList()).
          then(function (dl) {
            deepEqual(dl, expected, "Match with '" + qs + "' (parsed query string)");
          })
      );
    });

    query_list = [
      'date < "2011"',
      'date <= "2011"',
      'date > "2011"',
      'date >= "2011"'
    ];

    query_list.forEach(function (qs) {
      promise.push(
        complex_queries.QueryFactory.create(qs, key_schema).
          exec(docList()).
          then(function (dl) {
            deepEqual(dl, [
            ], "Match with an invalid parsed string " + qs + " should return empty list but not raise errors");
          })
      );
    });

    RSVP.all(promise).then(noop).always(start);
  });

}));
