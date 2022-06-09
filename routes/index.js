var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async(req, res) => {
  res.redirect('/books');
}));

/* GET All books */
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll();
  res.render('index', {books, title:'Books'});
}));

// /* GET individual book */
// router.get('/books/:id', asyncHandler(async(req, res) => {
//   const books = await Book.findAll();
//   res.render('update-book', {books, title:'Books'});
// }));

/* GET new book form */
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render('new-book', {book: {}, title:'New Book'});
}));

/* POST create book */
router.post('/books/new', asyncHandler(async(req, res) => {
  const book = await Book.create(req.body);
  res.redirect('/books');
}));





module.exports = router;
