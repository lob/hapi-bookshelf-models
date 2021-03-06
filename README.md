# :warning: No Longer Supported :warning:

**We will not be making changes, accepting pull requests, or cutting new versions of this repository.**

We no longer recommend using this repository as it does not promote best practices.

- While it makes it easier by loading in all of the models in a directory, it adds a bit of magic to the loading process that should be left explicit.
- It makes it harder to reference these models once you start fleshing out your codebase i.e. pulling your code into separate files. For you to be able to access any of your models in another file, you'll need to have access to the `server` object so you'll have to pass that around, even though you don't need the entire object.
- We don't actively maintain this repo since we don't really use it ourselves anymore.
- The [Bookshelf registry plugin](https://github.com/tgriesser/bookshelf/wiki/Plugin:-Model-Registry) is required when using this modules, but if you don't actually need it (i.e. you don't have circular dependencies with your models), then it just adds unnecessary complexity to your project.
- The creator of Hapi [frowns upon](https://gist.github.com/hueniverse/f01faf422eb038d87d57#when-should-i-not-use-multiple-plugins) using plugins in this manner.

Instead, we recommend just `require`ing the models as you need them. That way, you can easily refer to the models and only include the ones that make sense to have in the current context.

# Hapi Bookshelf Models
[![Build Status](https://travis-ci.org/lob/hapi-bookshelf-models.svg)](https://travis-ci.org/lob/hapi-bookshelf-models)
[![Coverage Status](https://coveralls.io/repos/lob/hapi-bookshelf-models/badge.svg?branch=master)](https://coveralls.io/r/lob/hapi-bookshelf-models?branch=master)
[![NPM version](https://badge.fury.io/js/hapi-bookshelf-models.svg)](https://npmjs.org/package/hapi-bookshelf-models)
[![Downloads](http://img.shields.io/npm/dm/hapi-bookshelf-models.svg)](https://npmjs.org/package/hapi-bookshelf-models)


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
      collections: '../path/to/collections/directory',
      base: {
        model: require('../path/to/model/base'), // optional
        collection: require('../path/to/collection/base') // optional
      }
    }
  }
], function (err) {
  // An error will be available here if anything goes wrong
});

// You can now access Bookshelf.js via server.plugins.bookshelf and
// models can be retrieved via server.plugins.bookshelf.model('ModelName')
```

# Options
- ```knex``` [Knex Configuration Object](http://knexjs.org/#Installation-client)
- ```plugins``` [Bookshelf.js Plugins](http://bookshelfjs.org/#Plugins) the _registry_ plugin is required
- ```models``` directory where you Bookshelf.js models are defined
- ```base``` (optional) function that applies the Bookshelf.js [extend method](http://bookshelfjs.org/#Model-extend) and returns the extended model, example below.
- ```namespace``` (optional) string that will control how models are exposed in the plugin. The intent is to support models coming from multiple knex connections or to logically segment models. Models can be accessed via `server.plugins.bookshelf.{namespace}.model('ModelName')`

### Example ```base```
```javascript
// Add timestamps to all models
base: function (bookshelf) {
  return bookshelf.Model.extend({
    hasTimestamps: true
  });
}
```

# Defining Models
There is more extensive documentation about defining models for the _registry_ plugin on the [Bookshelf.js Wiki](https://github.com/tgriesser/bookshelf/wiki/Plugin:-Model-Registry). Below is an example of defining two related models that can be placed in the ```models``` directory referenced above. `baseModel` is the Bookshelf model created by the `base` option or just the basic Bookshelf model if you didn't define one. `bookshelf` is a Bookshelf instance with a connection to the database defined when the plugin was registered.
```javascript
// user.js
module.exports = function (baseModel, bookshelf) {
  return baseModel.extend({
    tableName: 'users',
    roles: function () {
      return this.belongsToMany('Role');
    }
  });
};

// role.js
module.exports = function (baseModel, bookshelf) {
  return baseModel.extend({
    tableName: 'roles'
  });
};
```
After loading these models you can access them via ```server.plugins.bookshelf.model('User')``` and ```server.plugins.bookshelf.model('Role')``` respectively.

### Notes:
- Models will be registered and made available under the file name with the first character capitalized. For example ```user.js``` becomes ```User``` and ```blogPost.js``` becomes ```BlogPost```

# Registering Multiple Namespaces
Modeling namespaces is a great way to expose models from multiple databases using the same interface. Below is an example of how you can do this.

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server();

server.register([
  {
    register: require('hapi-bookshelf-models'),
    options: {
      knex: {
        // connection one details
      },
      plugins: ['registry'],
      models: '../path/to/namespaceone/models/directory',
      namespace: 'namespaceone'
    }
  },
  {
    register: require('hapi-bookshelf-models'),
    options: {
      knex: {
        //connection two details
      },
      plugins: ['registry'],
      models: '../path/to/namespacetwo/models/directory',
      namespace: 'namespacetwo'
    }
  }
], function (err) {
  // An error will be available here if anything goes wrong
});

// You can access the namespaceone models via server.plugins.bookshelf.namespaceone.model('ModelName')
// You can access the namespacetwo models via server.plugins.bookshelf.namespacetwo.model('ModelName')
```
