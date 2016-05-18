var fs    = require('fs');
var Joi   = require('joi');
var glob  = require('glob');
var path  = require('path');

exports.register = function (server, options, next) {

  var bookshelf = null;

  var schema = {
    knex: Joi.object().required(),
    plugins: Joi.array().items(Joi.string()).default([]),
    models: Joi.array().items(Joi.string()).single().default([]),
    collections: Joi.array().items(Joi.string()).single().default([]),
    base: Joi.alternatives().try(Joi.func(), Joi.object({
      model: Joi.func().optional(),
      collection: Joi.func().optional()
    })).optional(),
    namespace: Joi.string().optional()
  };

  var result = Joi.validate(options, schema);
  if (result.error) {
    return next(result.error);
  }
  options = result.value;

  try {
    var knex = require('knex')(options.knex);
    bookshelf = require('bookshelf');
    bookshelf = bookshelf(knex);
  } catch (ex) {
    return next(new Error('Bad Knex Options: ' + ex.toString()));
  }

  options.plugins.map(function (plugin) {
    bookshelf.plugin(plugin);
  });

  var baseModel;
  var baseCollection;
  if (options.base) {
    if (typeof options.base === 'function') {
      baseModel = options.base(bookshelf);
    } else {
      if (options.base.model) {
        baseModel = options.base.model(bookshelf);
      }
      if (options.base.collection) {
        baseCollection = options.base.collection(bookshelf);
      }
    }
  }

  if (!baseModel) {
    baseModel = bookshelf.Model.extend({});
  }
  if (!baseCollection) {
    baseCollection = bookshelf.Collection.extend({});
  }

  function load (type, globPaths) {
    var base = type === 'model' ? baseModel : baseCollection;
    var gFiles = [];
    var modelObjects = [];
    for (var i = globPaths.length - 1; i >= 0; i--) {
      var filename = globPaths[i];
      if (!glob.hasMagic(filename)) {
        filename = path.resolve(filename);
        var stats = fs.lstatSync(filename);
        if (stats.isDirectory()) {
          filename = path.join(filename, '*.js');
        }
      }
      gFiles = glob.sync(filename);
      modelObjects = modelObjects.concat(gFiles);
    }

    for (var o = modelObjects.length - 1; o >= 0; o--) {
      var model = modelObjects[o];

      if (fs.lstatSync(model).isFile()) {
        var modelDir = path.dirname(model);
        var fileName = path.basename(model)
          .replace(path.extname(model), '');
        if (!/^\..*/.test(fileName)) {
          var modelPath = path.resolve(path.join(modelDir, fileName));
          var modelName = fileName[0].toUpperCase() + fileName.substr(1);
          var modelDef = require(modelPath)(base, bookshelf);
          bookshelf[type](modelName, modelDef);
        }
      }
    }
  }

  load('model', options.models);
  load('collection', options.collections);

  if (options.namespace) {
    server.expose(options.namespace, bookshelf);
  } else {
    server.expose(bookshelf);
  }
  next();
};

exports.register.attributes = {
  name: 'bookshelf',
  version: '1.0.0',
  multiple: true
};
