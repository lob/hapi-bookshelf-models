var fs    = require('fs');
var Joi   = require('joi');
var glob  = require('glob');
var path  = require('path');

exports.register = function (server, options, next) {

  var bookshelf = null;
  var modelObjects = [];

  var schema = {
    knex: Joi.object().required(),
    plugins: Joi.array().items(Joi.string()).default([]),
    models: Joi.array().items(Joi.string()).single().required(),
    base: Joi.func().optional(),
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
  if (options.base) {
    baseModel = options.base(bookshelf);
  } else {
    baseModel = bookshelf.Model.extend({});
  }

  var gFiles = [];
  for (var i = options.models.length - 1; i >= 0; i--) {
    var filename = options.models[i];
    if (!glob.hasMagic(filename)) {
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
        var modelName = fileName[0].toUpperCase() + fileName.substr(1);
        bookshelf.model(modelName,
          require(path.join(modelDir, fileName))
          (baseModel, bookshelf));
      }
    }
  }

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
