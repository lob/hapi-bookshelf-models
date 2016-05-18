var chai    = require('chai');
var expect  = chai.expect;
var Hapi    = require('hapi');
var path    = require('path');

describe('bookshelf plugin', function () {
  it('should fail to load with bad knex', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {},
          models: 'asdf',
          base: function () {
            return 1;
          }
        }
      }
    ], function (err) {
      expect(err).to.be.instanceof(Error);
    });
  });

  it('should fail to load with bad schema', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'pg',
            connection: {
              host: '',
              user: '',
              password: '',
              database: ''
            }
          },
          plugins: 'asdf'
        }
      }
    ], function (err) {
      expect(err).to.be.instanceof(Error);
    });
  });

  it('should load a good configuration', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: path.join(__dirname + '/models'),
          base: function (bookshelf) {
            return bookshelf.Model.extend({
              test: 'test'
            });
          }
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
      expect(server.plugins.bookshelf.model('Role')).to.be.undefined;
      var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
      expect(User.test).to.eql('test');
    });
  });

  it('should load a good configuration with relative path', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: 'test/models',
          base: function (bookshelf) {
            return bookshelf.Model.extend({
              test: 'test'
            });
          }
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
      expect(server.plugins.bookshelf.model('Role')).to.be.undefined;
      var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
      expect(User.test).to.eql('test');
    });
  });

  it('should load a good configuration with glob', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: [
            path.join(__dirname + '/models/*.js'),
            path.join(__dirname + '/models/subfolder/*.js')
          ],
          base: function (bookshelf) {
            return bookshelf.Model.extend({
              test: 'test'
            });
          }
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
      expect(server.plugins.bookshelf.model('Role')).to.be.a('function');
      var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
      expect(User.test).to.eql('test');
    });
  });

  it('should load a good configuration with recursive glob as array',
    function () {
      var server = new Hapi.Server();

      server.register([
        {
          register: require('../lib/'),
          options: {
            knex: {
              client: 'sqlite3',
              connection: {
                filename: './database.sqlite'
              }
            },
            plugins: ['registry'],
            models: [path.join(__dirname + '/models/**/*.js')],
            base: function (bookshelf) {
              return bookshelf.Model.extend({
                test: 'test'
              });
            }
          }
        }
      ], function (err) {
        expect(err).to.be.undefined;
        expect(server.plugins.bookshelf.model('User')).to.be.a('function');
        expect(server.plugins.bookshelf.model('Role')).to.be.a('function');
        var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
        expect(User.test).to.eql('test');
      }
    );
  });

  it('should load a good configuration with recursive glob as string',
    function () {
      var server = new Hapi.Server();

      server.register([
        {
          register: require('../lib/'),
          options: {
            knex: {
              client: 'sqlite3',
              connection: {
                filename: './database.sqlite'
              }
            },
            plugins: ['registry'],
            models: path.join(__dirname + '/models/**/*.js'),
            base: function (bookshelf) {
              return bookshelf.Model.extend({
                test: 'test'
              });
            }
          }
        }
      ], function (err) {
        expect(err).to.be.undefined;
        expect(server.plugins.bookshelf.model('User')).to.be.a('function');
        expect(server.plugins.bookshelf.model('Role')).to.be.a('function');
        var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
        expect(User.test).to.eql('test');
      }
    );
  });

  it('should load a good configuration with absolute path as string',
    function () {
      var server = new Hapi.Server();

      server.register([
        {
          register: require('../lib/'),
          options: {
            knex: {
              client: 'sqlite3',
              connection: {
                filename: './database.sqlite'
              }
            },
            plugins: ['registry'],
            models: path.join(__dirname + '/models/user.js'),
            base: function (bookshelf) {
              return bookshelf.Model.extend({
                test: 'test'
              });
            }
          }
        }
      ], function (err) {
        expect(err).to.be.undefined;
        expect(server.plugins.bookshelf.model('User')).to.be.a('function');
        var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
        expect(User.test).to.eql('test');
      }
    );
  });

  it('should load a good configuration with absolute paths as array',
    function () {
      var server = new Hapi.Server();

      server.register([
        {
          register: require('../lib/'),
          options: {
            knex: {
              client: 'sqlite3',
              connection: {
                filename: './database.sqlite'
              }
            },
            plugins: ['registry'],
            models: [
              path.join(__dirname + '/models/user.js'),
              path.join(__dirname + '/models/subfolder/role.js')
            ],
            base: function (bookshelf) {
              return bookshelf.Model.extend({
                test: 'test'
              });
            }
          }
        }
      ], function (err) {
        expect(err).to.be.undefined;
        expect(server.plugins.bookshelf.model('User')).to.be.a('function');
        expect(server.plugins.bookshelf.model('Role')).to.be.a('function');
        var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
        expect(User.test).to.eql('test');
      }
    );
  });

  it('should load combination of models',
    function () {
      var server = new Hapi.Server();
      var _baseOptions = {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          base: function (bookshelf) {
            return bookshelf.Model.extend({
              test: 'test'
            });
          }
        }
      };

      _baseOptions.options.models = [
        path.join(__dirname + '/models/user.js'),
        path.join(__dirname + '/models/subfolder/**/*.js')
      ];
      server.register([_baseOptions], function (err) {
        expect(err).to.be.undefined;
        expect(server.plugins.bookshelf.model('User')).to.be.a('function');
        expect(server.plugins.bookshelf.model('Role')).to.be.a('function');
        var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
        expect(User.test).to.eql('test');
      });

  });

  it('should load a good configuration without base', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: path.join(__dirname + '/models')
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
    });
  });

  it('should allow namespacing', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: path.join(__dirname + '/models'),
          namespace: 'test'
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.test.model('User')).to.be.a('function');
    });
  });

  it('should load a good configuration with base object', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: path.join(__dirname + '/models'),
          base: {
            model: function (bookshelf) {
              return bookshelf.Model.extend({
                test: 'test'
              });
            }
          }
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
      var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
      expect(User.test).to.eql('test');
    });
  });

  it('should load a good configuration with base collection', function () {
    var server = new Hapi.Server();

    server.register([
      {
        register: require('../lib/'),
        options: {
          knex: {
            client: 'sqlite3',
            connection: {
              filename: './database.sqlite'
            }
          },
          plugins: ['registry'],
          models: path.join(__dirname + '/models'),
          collections: path.join(__dirname + '/collections'),
          base: {
            collection: function (bookshelf) {
              return bookshelf.Collection.extend({
                test: 'test'
              });
            }
          }
        }
      }
    ], function (err) {
      expect(err).to.be.undefined;
      expect(server.plugins.bookshelf.model('User')).to.be.a('function');
      expect(server.plugins.bookshelf.collection('Users')).to.be.a('function');
      var User = server.plugins.bookshelf.model('User').forge({ id: 1 });
      var Users = server.plugins.bookshelf.collection('Users').forge([User]);
      expect(Users.test).to.eql('test');
    });
  });
});
