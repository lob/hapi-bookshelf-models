# Hapi Bookshelf Models
[![Build Status](https://travis-ci.org/lob/hapi-bookshelf-models.svg)](https://travis-ci.org/lob/hapi-bookshelf-models)
[![Coverage Status](https://coveralls.io/repos/lob/hapi-bookshelf-models/badge.png?branch=master)](https://coveralls.io/r/lob/hapi-bookshelf-models?branch=master)


The purpose of this plugin is to provide a convenient way to register [Bookshelf.js](http://bookshelfjs.org/) models and expose them via a [Hapi](http://hapijs.com/) plugin.

# Registering the Plugin
```javascript
var Hapi = require('hapi');

var server = new Hapi.Server();

server.register([
  {
    register: require('hapi-bookshelf-models'),
    options: {
      knex: {
        client: 'pg',
        connection: {
          host: 'localhost',
          user: 'username',
          password: 'password',
          database: 'db_name',
          port: 5432
        }
      },
      plugins: ['registry'], // Required
      models: '../path/to/models/directory',
      base: require('../path/to/model/base')
    }
  }
], function (err) {
  // An error will be available here if anything goes wrong
});

// You can now access Bookshelf.js via server.plugins.bookshelf and 
// models can be retrieved via server.plugins.bookshelf.model('ModelName')
```

# Options
- ```knex``` [Knex Confuration Object](http://knexjs.org/#Installation-client)
- ```plugins``` [Bookshelf.js Plugins](http://bookshelfjs.org/#Plugins) the _registry_ plugin is required
- ```models``` directory where you Bookshelf.js models are defined
- ```base```options that will be passed to the Bookshelf.js [extend method](http://bookshelfjs.org/#Model-extend)

# Defining Models
There is more extensive documentation about defining models for the _registry_ plugin on the [Bookshelf.js Wiki](https://github.com/tgriesser/bookshelf/wiki/Plugin:-Model-Registry). Below is an example of defining two related models that can be placed in the ```models``` directory referenced above.
```javascript
// user.js
module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'users',
    roles: function () {
      return this.belongsToMany('Role');
    }
  });
};  

// role.js
module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'roles'
  });
};
```
After loading these models you can access them via ```server.plugins.bookshelf.model('User')``` and ```server.plugins.bookshelf.model('Role')``` respectively.

### Notes:
- Models will be registered and made available under the file name with the first character capitalized. For example ```user.js``` becomes ```User``` and ```blogPost.js``` becomes ```BlogPost```
