import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';
import sendFile from '../utils/sendFile.js';

export default (fastify, options, done) => {
  //#region получение книги по id
  fastify.get('/:id', async (request, reply) => {
    try {
      const book = await db.get(
        `SELECT book.id, book.name, book.price, shell.name as shell, author.full_name as author, genre.name as genre, book.publication_date, book.rating, language.name as language, age_limit.age as age_limit, book.type_of_content, book.number_of_pages, book.description, NOT length(book.pdf) = 0 AS pdf_exists
      FROM book
      INNER JOIN shell ON book.shell_id = shell.id
      INNER JOIN author ON book.author_id = author.id
      INNER JOIN genre ON book.genre_id = genre.id
      INNER JOIN language ON book.language_id = language.id
      INNER JOIN age_limit ON book.age_limit_id = age_limit.id
      WHERE book.id = $id`,
        {
          $id: request.params.id,
        }
      );

      reply.send(
        response({
          data: { ...mapper(book), image: `${request.url}/shell` },
        })
      );
    } catch (error) {
      throw new Error('Такой книги нет');
    }
  });
  //#endregion

  fastify.get('/:id/shell', async (request, reply) => {
    await sendFile('SELECT image FROM book WHERE id = $id', { $id: request.params.id }, reply);
  });

  fastify.get('/:id/pdf', async (request, reply) => {
    await sendFile('SELECT pdf FROM book WHERE id = $id', { $id: request.params.id }, reply);
  });

  //#region  подучение 10 случайных книг на главную страницу
  fastify.get('/random/:count?', async (request, reply) => {
    const { count } = await db.get('SELECT count(*) AS count FROM book');
    const books = await db.all(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      ORDER BY RANDOM()
      LIMIT $count`,
      { $count: request.params['count?'] || 10 }
    );
    //#endregion

    reply.send(
      response({
        data: {
          total: count,
          list: books.map(book => ({
            ...mapper(book),
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  });

  //#region  подучение 10 рейтинговых книг на главную страницу
  fastify.get('/popular/:count?', async (request, reply) => {
    const { count } = await db.get('SELECT count(*) AS count FROM book');
    const books = await db.all(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
        FROM book
        INNER JOIN author ON book.author_id = author.id
        ORDER BY book.rating DESC
        LIMIT $count`,
      { $count: request.params['count?'] || 10 }
    );
    //#endregion
    reply.send(
      response({
        data: {
          total: count,
          list: books.map(book => ({
            ...mapper(book),
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  });

  done();
};
