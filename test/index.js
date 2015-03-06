"use strict";

var url = require('url');
var assert = require('assert');

var url42 = require('..');

function testWithoutArguments(funcName) {
  var result = url42('first');

  assert.throws(result[funcName].bind(this), Error, 'should throw error');
}

/*
  [from, path, expected]
*/
var tests = {

  setPath: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', 'quux', 'quux' ],
    [ '/foo/bar/baz', 'quux/asdf', 'quux/asdf' ],
    [ '/foo/bar/baz', '../quux/baz', '../quux/baz' ],
    [ '/foo/bar/baz', '/bar', '/bar' ],
    [ '/foo/bar/baz', '../../../../../../../../quux/baz', '../../../../../../../../quux/baz' ],
    [ '/foo', '.', '.' ],
    [ '/foo', '..', '..' ],
    [ '/foo/bar', '.', '.' ],
    [ '/foo/bar', '..', '..' ],
    [ '/foo/bar/', '.', '.' ],
    [ '/foo/bar/', '..', '..' ],
    [ 'foo/bar', '../../../baz', '../../../baz' ],
    [ 'foo/bar/', '../../../baz', '../../../baz' ],
    [ '/foo/bar/baz', '/../etc/passwd', '/../etc/passwd' ],
    [ '/foo/bar/baz', 'quux?arg1=1', 'quux' ],
    [ '/foo/bar/baz?arg1=1', 'quux', 'quux?arg1=1' ]
  ],

  joinPath: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', 'quux', '/foo/bar/baz/quux' ],
    [ '/foo/bar/baz', 'quux/baz', '/foo/bar/baz/quux/baz' ],
    [ '/foo/bar/baz', '../quux/baz', '/foo/bar/quux/baz' ],
    [ '/foo/bar/baz', '/bar', '/foo/bar/baz/bar' ],
    [ '/foo/bar/baz/', 'quux', '/foo/bar/baz/quux' ],
    [ '/foo/bar/baz/', 'quux/baz', '/foo/bar/baz/quux/baz' ],
    [ '/foo/bar/baz', '../../../../../../../../quux/baz', '/quux/baz' ],
    [ '/foo/bar/baz', '../../../../../../../quux/baz', '/quux/baz' ],
    [ '/foo', '.', '/foo' ],
    [ '/foo', '..', '/' ],
    [ '/foo/', '.', '/foo' ],
    [ '/foo/', '..', '/' ],
    [ '/foo/bar', '.', '/foo/bar' ],
    [ '/foo/bar', '..', '/foo' ],
    [ '/foo/bar/', '.', '/foo/bar' ],
    [ '/foo/bar/', '..', '/foo' ],
    [ 'foo/bar', '../../../baz', '../baz' ],
    [ 'foo/bar/', '../../../baz', '../baz' ],
    [ '/foo/bar/baz', '/../etc/passwd', '/foo/bar/etc/passwd' ]
  ],

  mergePath: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', 'quux', '/foo/bar/bazquux' ],
    [ '/foo/bar/baz', 'quux/baz', '/foo/bar/bazquux/baz' ],
    [ '/foo/bar/baz', '../quux/baz', '/foo/bar/baz../quux/baz' ],
    [ '/foo/bar/baz', '/bar', '/foo/bar/baz/bar' ],
    [ '/foo/bar/baz/', 'quux', '/foo/bar/baz/quux' ],
    [ '/foo/bar/baz/', 'quux/baz', '/foo/bar/baz/quux/baz' ],
    [ '/foo/bar/baz', '../../../../../../../../quux/baz', '/foo/bar/baz../../../../../../../../quux/baz' ],
    [ '/foo/bar/baz', '../../../../../../../quux/baz', '/foo/bar/baz../../../../../../../quux/baz' ],
    [ '/foo', '.', '/foo' ],
    [ '/foo', '..', '/foo..' ],
    [ '/foo/', '.', '/foo/' ],
    [ '/foo/', '..', '/foo/..' ],
    [ '/foo/bar', '.', '/foo/bar' ],
    [ '/foo/bar', '..', '/foo/bar..' ],
    [ '/foo/bar/', '.', '/foo/bar/' ],
    [ '/foo/bar/', '..', '/foo/bar/..' ],
    [ 'foo/bar', '../../../baz', 'foo/bar../../../baz' ],
    [ 'foo/bar/', '../../../baz', 'foo/bar/../../../baz' ],
    [ '/foo/bar/baz', '/../etc/passwd', '/foo/bar/baz/etc/passwd' ]
  ],

  setQuery: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', '?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz', 'quux', '/foo/bar/baz' ],
    [ '/foo/bar/baz?arg1=1', 'quux', '/foo/bar/baz' ],
    [ '/foo/bar/baz?arg1=1', 'quux?', '/foo/bar/baz?' ],
    [ '/foo/bar/baz', 'quux?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=2', '/foo/bar/baz?arg1=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=1&arg2=2', '/foo/bar/baz?arg1=1&arg2=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=2', '/foo/bar/baz?arg1=2' ]
  ],

  joinQuery: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', '?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz', 'quux', '/foo/bar/baz' ],
    [ '/foo/bar/baz?arg1=1', 'quux', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz?arg1=1', 'quux?', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz', 'quux?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=2', '/foo/bar/baz?arg1=1&arg1=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=1&arg2=2', '/foo/bar/baz?arg1=1&arg1=1&arg2=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=2', '/foo/bar/baz?arg1=1&arg1=2' ]
  ],

  mergeQuery: [
    [ '/foo/bar/baz', '', '/foo/bar/baz' ],
    [ '/foo/bar/baz', '?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz', 'quux', '/foo/bar/baz' ],
    [ '/foo/bar/baz?arg1=1', 'quux', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz?arg1=1', 'quux?', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz', 'quux?arg1=1', '/foo/bar/baz?arg1=1' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=2', '/foo/bar/baz?arg1=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg1=a&arg2=2', '/foo/bar/baz?arg1=a&arg2=2' ],
    [ '/foo/bar/baz?arg1=1', 'quux?arg2=2', '/foo/bar/baz?arg1=1&arg2=2' ]
  ]

};

function testWithUrls(funcName) {
  var relativeTests = tests[funcName];

  relativeTests.forEach(function(relativeTest) {
    var a = url42(relativeTest[0], relativeTest[1])[funcName]().format();
    var e = relativeTest[2];

    assert.equal(
      a, e,
      funcName + '(' + [relativeTest[0], relativeTest[1]] + ') == ' + e +
        '\n  actual=' + a);
  });
}

function testCalledTwice(funcName, shouldMatch) {
  var a = '/path/bla?toto=lala', b = '/testouille?lala=toto';

  var url = url42(a, b)[funcName]();

  var result1 = url.format();
  var result2 = url[funcName]().format();

  assert[shouldMatch ? 'equal' : 'notEqual'](
    result1,
    result2,
    'should' + (!shouldMatch ? ' not ' : ' ') + 'match'
  );
}

describe('url42', function () {

  describe('constructor', function () {

    describe('no arguments', function () {

      it('should throw an error when called without arguments', function () {
        assert.throws(url42, Error, 'should throw error');
      });

    });

    describe('first argument', function () {

      it('should accept a String as first argument', function () {
        assert.doesNotThrow(url42.bind(this, 'first'), 'should not throw error');
      });

      it('should only accept a String as first argument', function () {
        [ 1, [], {}, /test/, new Date() ].forEach(function (type) {
          assert.throws(url42.bind(this, type), Error, 'should throw error');
        });
      });

    });

    describe('second argument', function () {

      it('should accept a String as second argument', function () {
        assert.doesNotThrow(url42.bind(this, 'first', 'second'), 'should not throw error');
      });

      it('should only accept a String as second argument', function () {
        [ 1, [], {}, /test/, new Date() ].forEach(function (type) {
          assert.throws(url42.bind(this, 'first', type), Error, 'should throw error');
        });
      });

    });

  });

  describe('setPath', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('setPath');
    });

    it('should set given path as root', function () {
      testWithUrls('setPath');
    });

    it('should give the same result if called twice', function () {
      testCalledTwice('setPath', true);
    });

  });

  describe('joinPath', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('joinPath');
    });

    it('should add given path as child', function () {
      testWithUrls('joinPath');
    });

    it('should not give the same result if called twice', function () {
      testCalledTwice('joinPath', false);
    });

  });

  describe('mergePath', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('mergePath');
    });

    it('should merge given paths', function () {
      testWithUrls('mergePath');
    });

    it('should not give the same result if called twice', function () {
      testCalledTwice('mergePath', false);
    });

  });

  describe('setQuery', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('setQuery');
    });

    it('should set url\'s query', function () {
      testWithUrls('setQuery');
    });

    it('should give the same result if called twice', function () {
      testCalledTwice('setQuery', true);
    });

  });

  describe('joinQuery', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('joinQuery');
    });

    it('should merge urls\' queries', function () {
      testWithUrls('joinQuery');
    });

    it('should not give the same result if called twice', function () {
      testCalledTwice('joinQuery', false);
    });

  });

  describe('mergeQuery', function () {

    it('should throw an error when called without argument', function () {
      testWithoutArguments('mergeQuery');
    });

    it('should merge urls\' queries', function () {
      testWithUrls('mergeQuery');
    });

    it('should give the same result if called twice', function () {
      testCalledTwice('mergeQuery', true);
    });

  });

  describe('chainability', function () {

    it('should be chainable', function () {
      var a = '/path/test?arg1=1';

      var result = url42(a)
        .mergePath('ouille')
        .setQuery('?lala=toto')
        .mergeQuery('toto?arg1=1&arg2=2')
        .format();

      assert.equal(result, '/path/testouille?lala=toto&arg1=1&arg2=2', 'should match');
    });

    it('should be chainable without giving an argument each time', function () {
      var a = '/path/bla?toto=lala', b = '/testouille?lala=toto';

      var result = url42(a, b)
        .setPath()
        .joinQuery()
        .format();

      assert.equal(result, '/testouille?toto=lala&lala=toto', 'should match');
    });

  });

});
