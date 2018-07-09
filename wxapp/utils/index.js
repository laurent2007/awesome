let getBooks = (ctx, cb) => {

  let tableId = 32279,
    Books = new wx.BaaS.TableObject(tableId)

  Books.find()
    .then(res => cb(res))
    .catch(err => console.dir(err))
}

module.exports = {
  getBooks,
}