var fs    = require('fs');
var Joi   = require('joi');
var path  = require('path');

exports.register = function (server, options, next) {

  var schema = {
    knex: Joi.object().required(),
    plugins: Joi.array().includes(Joi.string()).default([]),
    models: Joi.string().required(),
    base: Joi.func().optional(),
    namespace: Joi.string().optional()
  };

  try {
    Joi.assert(options, schema, 'Invalid Configuration Object');
  } catch (ex) {
    return next(ex);
  }

  var bookshelf;
  try {
    bookshelf = require('bookshelf')(require('knex')(options.knex));
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

  fs.readdirSync(options.models).forEach(function (model) {
    var modelName = path.basename(model).replace(path.extname(model), '');
    modelName = modelName[0].toUpperCase() + modelName.substr(1);
    bookshelf.model(modelName,
      require(path.join(options.models, model))(baseModel));
  });

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
