module.exports = function (baseCollection, bookshelf) {
  return baseCollection.extend({
    model: bookshelf.model('User')
  });
};
