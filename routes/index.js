var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
const perPage = 5;
let cleansed;

/* Handler function to wrap each route. */

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // res.status(500).send(error);
      next(error);
    }
  }
}

/* Function to strip away unnecessary characters from query*/

const queryCleanser=(searchInput)=>{
  const query=JSON.stringify(Object.values(searchInput));
  cleansed = query
    .replaceAll("[","")
    .replaceAll(`"`,"")
    .replaceAll(`]`,"")

  return cleansed;
}
/* Convert Query to Title Case */
const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}
/* GET home page. */
router.get('/', asyncHandler(async(req, res) => {
  res.redirect('/books');
}));


/* GET All books/Search Feature */
router.get('/books', asyncHandler(async(req, res) => {
  const number=req.params.number;
  const offset= (number*perPage)-perPage;
  let books;
  let buttons;

  queryCleanser(req.query);
  
  if(cleansed !==''){
   
    const titleCaseQuery= titleCase(cleansed);

    books = await Book.findAll({ where: {
        [Op.or]: [{title:titleCaseQuery}, {title:{[Op.like]:`%${titleCaseQuery}%`}},{author:titleCaseQuery},{author:{[Op.like]:`%${titleCaseQuery}%`}},{genre:titleCaseQuery}, {year:titleCaseQuery}]
        }});
    if(Object.keys(books).length/5 > 1 ){
      buttons=Math.ceil(Object.keys(books).length/perPage);
    }
  } else {
    books = await Book.findAll({limit:perPage});
    const allBooks = await Book.findAll();
    buttons=Math.ceil(Object.keys(allBooks).length/perPage);
  }

  res.render('index', {books, buttons, title:'Books'});
}));


router.get('/books/page:number', asyncHandler(async(req, res) => {
  const number=req.params.number;
  const offset= (number*perPage)-perPage;
  let books; 
  let buttons;

  queryCleanser(req.query);

  if(cleansed!==''){
    const titleCaseQuery = titleCase(cleansed);
    books = await Book.findAll({ where: {
      [Op.or]: [{title:{[Op.like]:`%${titleCaseQuery}%`}},{author:{[Op.like]:`%${titleCaseQuery}%`}},{genre:{[Op.like]:`%${titleCaseQuery}%`}},{year:{[Op.like]:`%${titleCaseQuery}%`}}]
      }});
    if(Object.keys(books).length/5 > 1 ){
      buttons=Math.ceil(Object.keys(books).length/perPage);
    }
  } else {
    books = await Book.findAll({offset,limit:perPage});
    const allBooks = await Book.findAll();
    buttons=Math.ceil(Object.keys(allBooks).length/perPage);
  }
  
  
  res.render('index', {books, buttons, title:'Books'});
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
  book ? res.render('update-book', {book, title: 'Update Book'}) : res.render('404', {message: 'Book does not exist'});
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
      res.render('404', {message: 'Book does not exist'});
    }
  } catch(error){
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', {book, errors: error.errors, title:'Edit Book'})
    } else {
      throw error;
    }
  }
}));




/* Delete individual book */
router.get('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  book ? res.render('update-book', {book, title: 'Update Book'}) : res.render('404', {message: 'Book does not exist'});;
}));

/* Delete book */
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    await book.destroy();
    res.redirect('/books');
  } else {
    res.render('404', {message: 'Book does not exist'});
  }
}));




module.exports = router;
