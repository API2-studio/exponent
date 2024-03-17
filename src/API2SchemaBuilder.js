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

export default class API2SchemaBuilder {
    constructor() {
        this.schema = [];
        this.reset();
    }

    reset() {
        this.schema = [];
    }

    setPostParam(name, type, options = {required: false, unique: false, default: null}) {
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

        if (typeof options !== 'object') {
            throw new Error('options must be an object');
        }

        this.schema.push({ name, type, options });
        return this;
    }

    setReadParam(name, field) {
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

        this.schema.push({ name, field });
        return this;
    }

    setReadSubquery(name, subquery) {
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

        
        this.schema.push({ name, subquery });
        return this;

    } 

    setPostType(name, type) {
        this.schema.find((param) => param.name === name).type = type;
        return this;
    }

    setPostOptions(name, options) {
        this.schema.find((param) => param.name === name).options = options;
        return this;
    }

    build() {
        return this.schema;
    }

    encode() {
        return JSON.stringify(this.schema);
    }
}

// The API2SchemaBuilder class is used to build a schema for the API2RequestBuilder
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
