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

});
