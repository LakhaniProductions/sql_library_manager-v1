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

/* GET new book form */
router.get('/books/new', (req, res) => {
  res.render('new-book', { book: {}, title:'New Book' });
});

/* POST create book */
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try{
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch(error){
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('new-book', {book, errors: error.errors, title:'New Book'})
    } else {
      throw error;
    }
  }
}));

/* Edit individual book */
router.get('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  book ? res.render('update-book', {book, title: 'Update Book'}):res.sendStatus(404);
  
}));

/* Update book */
router.post('/books/:id', asyncHandler(async(req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      res.sendStatus(404);
    }
  } catch(error){
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('new-book', {book, errors: error.errors, title:'New Book'})
    } else {
      throw error;
    }
  }
}));

/* Delete individual book */
router.get('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  book ? res.render('update-book', {book, title: 'Update Book'}) : res.sendStatus(404);
}));

/* Delete book */
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    await book.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }
}));





module.exports = router;
