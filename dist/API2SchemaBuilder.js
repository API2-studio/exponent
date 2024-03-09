"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// This is a class that is used to build a schema for the API2RequestBuilder
// class. The schema is used to define the structure of the data that will be
// returned from the API.
//
// The schema is built using a fluent interface, which allows the developer to
// chain method calls together to build the schema in a readable and
// maintainable way.
//
// The schema is defined using a set of methods that allow the developer to
// specify the structure of the data that will be returned from the API. These
// methods include methods for defining the base URL, headers, and query
// parameters, as well as methods for defining the structure of the response
// data.
var API2SchemaBuilder = exports["default"] = /*#__PURE__*/function () {
  function API2SchemaBuilder() {
    _classCallCheck(this, API2SchemaBuilder);
    this.schema = [];
    this.reset();
  }
  _createClass(API2SchemaBuilder, [{
    key: "reset",
    value: function reset() {
      this.schema = [];
    }
  }, {
    key: "setPostParam",
    value: function setPostParam(name, type) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        required: false,
        unique: false,
        "default": null
      };
      if (!name) {
        throw new Error('name is required');
      }
      if (!type) {
        throw new Error('type is required');
      }
      if (typeof name !== 'string') {
        throw new Error('name must be a string');
      }
      if (typeof type !== 'string') {
        throw new Error('type must be a string');
      }
      if (_typeof(options) !== 'object') {
        throw new Error('options must be an object');
      }
      this.schema.push({
        name: name,
        type: type,
        options: options
      });
      return this;
    }
  }, {
    key: "setReadParam",
    value: function setReadParam(name, field) {
      if (!name) {
        throw new Error('name is required');
      }
      if (!field) {
        throw new Error('field is required');
      }
      if (typeof name !== 'string') {
        throw new Error('name must be a string');
      }
      if (typeof field !== 'string') {
        throw new Error('field must be a string');
      }
      this.schema.push({
        name: name,
        field: field
      });
      return this;
    }
  }, {
    key: "setReadSubquery",
    value: function setReadSubquery(name, subquery) {
      if (!name) {
        throw new Error('name is required');
      }
      if (!subquery) {
        throw new Error('subquery is required');
      }
      if (typeof name !== 'string') {
        throw new Error('name must be a string');
      }
      if (typeof subquery !== 'string') {
        throw new Error('subquery must be a string');
      }
      this.schema.push({
        name: name,
        subquery: subquery
      });
      return this;
    }
  }, {
    key: "setPostType",
    value: function setPostType(name, type) {
      this.schema.find(function (param) {
        return param.name === name;
      }).type = type;
      return this;
    }
  }, {
    key: "setPostOptions",
    value: function setPostOptions(name, options) {
      this.schema.find(function (param) {
        return param.name === name;
      }).options = options;
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      return this.schema;
    }
  }]);
  return API2SchemaBuilder;
}(); // The API2SchemaBuilder class is used to build a schema for the API2RequestBuilder
// class. The schema is used to define the structure of the data that will be
// returned from the API.
//
// The schema is built using a fluent interface, which allows the developer to
// chain method calls together to build the schema in a readable and
// maintainable way.
//
// Example usage:
//
// const schema = new API2SchemaBuilder()
//   .setParam('id', 'number')
//   .setParam('name', 'string')
//   .setParam('email', 'string')
//   .build();
//
// console.log(schema);
//
// Output:
//
// [
//   { name: 'id', type: 'number', options: {} },
//   { name: 'name', type: 'string', options: {} },
//   { name: 'email', type: 'string', options: {} },
// ]
// The schema is defined using a set of methods that allow the developer to
// specify the structure of the data that will be returned from the API. These
// methods include methods for defining the base URL, headers, and query
// parameters, as well as methods for defining the structure of the response
// data.
//
// Another example usage:
//
// const schema = new API2SchemaBuilder()
//   .setParam('id', 'uuid')
//   .setParam('name', 'varchar')
//   .setParam('email', 'varchar')
//   .setType('username', 'varchar')
//   .build();
// console.log(schema);
//
// Output:
//
// [
//   { name: 'id', type: 'uuid', options: {} },
//   { name: 'name', type: 'varchar', options: {} },
//   { name: 'email', type: 'varchar', options: {} },
//   { name: 'username', type: 'varchar', options: {} },
// ]
// 
// The API2SchemaBuilder class is used to build a schema for the API2RequestBuilder
// class. The schema is used to define the structure of the data that will be
// returned from the API.
//  
// Example usage with options 
//
// const schema = new API2SchemaBuilder()
//   .setParam('id', 'uuid', {required: true, unique: true, default: 'gen_random_uuid()'})
//   .setParam('name', 'varchar', {required: true, unique: true, default: 'name'})
//   .setParam('email', 'varchar', {required: true, unique: true, default: 'email'})
//   .setType('username', 'varchar')
//   .build();
//
// console.log(schema);
//
// Output:
//
// [
//   { name: 'id', type: 'uuid', options: {required: true, unique: true, default: 'gen_random_uuid()' } },
//   { name: 'name', type: 'varchar', options: {required: true, unique: true, default: 'name'} },
//   { name: 'email', type: 'varchar', options: {required: true, unique: true, default: 'email'} },
//   { name: 'username', type: 'varchar', options: {} },
// ]