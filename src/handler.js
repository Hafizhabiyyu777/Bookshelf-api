/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable eqeqeq */
const { nanoid } = require('nanoid');
const books = require('./bookshelf');

const responsehandler = (h, message, code, status) => {
  const response = h.response({
    status,
    message,
  });
  response.code(code);
  return response;
};

const addBookhandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const id = nanoid(16);
  if (!name) {
    return responsehandler(h, 'Gagal menambahkan buku. Mohon isi nama buku', 400, 'fail');
  }

  if (readPage > pageCount) {
    return responsehandler(h, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', 400, 'fail');
  }
  let finished = false;

  if (pageCount === readPage) {
    finished = true;
  }

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBooks = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBooks);
  //   console.log(newBooks);
  const isSucces = books.filter((book) => book.id === id).length > 0;
  if (isSucces) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  return responsehandler(h, 'Catatan gagal ditambahkan', 500, 'fail');
};

const getAllBooksHandler = (request, h) => {
  const { reading } = request.query;
  const { finished } = request.query;
  const { name } = request.query;

  //   console.log(`Cek reading : ${reading}`);
  //   console.log(`Cek finish : ${finished}`);
  //   console.log(`Cek name: ${name}`);
  let itembooks;
  if (reading === undefined && finished === undefined && name === undefined) {
    itembooks = books.map((book) => {
      // eslint-disable-next-line no-shadow
      const { id, name, publisher } = book;
      return { id, name, publisher };
    });
  } else if (reading !== undefined) {
    itembooks = books
      .filter((book) => book.reading == reading)
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  } else if (finished !== undefined) {
    // console.log("Berhasil masuk finish");

    itembooks = books
      .filter((book) => book.finished == finished)
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  } else {
    // console.log("Berhasil masuk named");

    itembooks = books
      .filter((book) => book.name.toLowerCase().includes(name.toLowerCase()))
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  }

  return {
    status: 'success',
    data: {
      books: itembooks,
    },
  };
};

const getBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((book) => book.id === bookId)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }
  return responsehandler(h, 'Buku tidak ditemukan', 404, 'fail');
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  if (!name) {
    return responsehandler(h, 'Gagal memperbarui buku. Mohon isi nama buku', 400, 'fail');
  }
  if (readPage > pageCount) {
    return responsehandler(h, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', 400, 'fail');
  }

  const idx = books.findIndex((book) => book.id === bookId);
  if (idx !== -1) {
    books[idx] = {
      ...books[idx],
      updatedAt,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    };
    // console.log(books[idx]);
    // const Data = books[idx];
    return responsehandler(h, 'Buku berhasil diperbarui', 200, 'success');
  }
  return responsehandler(h, 'Gagal memperbarui buku. Id tidak ditemukan', 404, 'fail');
};

const deleteBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const idx = books.findIndex((book) => book.id === bookId);
  if (idx !== -1) {
    books.splice(idx, 1);
    return responsehandler(h, 'Buku berhasil dihapus', 200, 'success');
  }
  return responsehandler(h, 'Buku gagal dihapus. Id tidak ditemukan', 404, 'fail');
};

module.exports = {
  addBookhandler,
  getAllBooksHandler,
  getBooksByIdHandler,
  editBookByIdHandler,
  deleteBooksByIdHandler,
};
