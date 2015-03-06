'use strict';

var url = require('url');
var path = require('path');
var util = require('util');

var Url = url.Url;

module.exports = (function (url, path) {
  /*jshint validthis:true */

  function Url42() {
    Url.call(this);
  }

  util.inherits(Url42, Url);

  function setPath() {
    if (this.link.pathname) {
      this.pathname = this.link.pathname;
    }
  }

  function joinPath() {
    if (this.link.pathname) {
      this.pathname = path.join(this.pathname, this.link.pathname);
    }
  }

  function mergePath() {
    if (this.link.pathname) {
      this.pathname += url.resolve('', this.link.pathname);
    }
  }

  function setQuery() {
    this.query = this.link.query;

    this.search = this.link.search;
  }

  function joinQuery() {
    if (this.link.search) {
      var linkSearch = this.link.search.substr(this.search ? 1 : 0);

      if (linkSearch) {
        this.search = (this.search ? this.search + '&' : '') + linkSearch;
      }
    }
  }

  function mergeQuery() {
    var baseQuery = this.query;
    var linkQuery = this.link.query;

    Object.keys(linkQuery).forEach(function (key) {
      baseQuery[key] = linkQuery[key];
    });

    delete this.search;
  }

  [ setPath, joinPath, mergePath, setQuery, joinQuery, mergeQuery ]
    .reduce(function (prototype, func) {
      prototype[func.name] = function (link) {
        if (link !== undefined) {
          this.link = url.parse(link, true);
        }

        if (! this.link) {
          throw new Error('no link provided');
        }

        this.changed = true;

        func.call(this);

        return this;
      };

      return prototype;
    }, Url42.prototype);

  function url42(baseHref, linkHref) {
    if (baseHref === undefined) {
      throw new Error('no base link provided');
    }

    var base = new Url42();

    base.parse(baseHref, true);

    if (linkHref !== undefined) {
      base.link = url.parse(linkHref, true);
    }

    return base;
  }

  return url42;
}(url, path));
