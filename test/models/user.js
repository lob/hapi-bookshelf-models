'use strict';

module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'users'
  });
};
