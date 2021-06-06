import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';
import sendFile from '../utils/sendFile.js';

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Получение книги по ID
  server.get('/:id', async (request, reply) => {
    try {
      const book = await db.get(
        `SELECT
          book.id,
          book.name,
          book.price,
          shell.name as shell,
          author.full_name as author,
          genre.name as genre,
          book.publication_date,
          book.rating,
          language.name as language,
          age_limit.age as age_limit,
          book.type_of_content,
          book.number_of_pages,
          book.description,
          NOT length(book.pdf) = 0 AS pdf_exists
        FROM book
        INNER JOIN shell ON book.shell_id = shell.id
        INNER JOIN author ON book.author_id = author.id
        INNER JOIN genre ON book.genre_id = genre.id
        INNER JOIN language ON book.language_id = language.id
        INNER JOIN age_limit ON book.age_limit_id = age_limit.id
        WHERE book.id = $id`,
        { $id: request.params.id }
      );

      book.favorited = false;
      book.readLater = false;

      if (request.user) {
        const { favorited } = await db.get('SELECT favorited FROM user WHERE id = $id', {
          $id: request.user.id,
        });
        const { later } = await db.get('SELECT read_later AS later FROM user WHERE id = $id', {
          $id: request.user.id,
        });
        const parsedFavorited = JSON.parse(favorited);
        const parsedReadLater = JSON.parse(later);

        book.favorited = parsedFavorited.includes(book.id);
        book.readLater = parsedReadLater.includes(book.id);
      }

      reply.send(
        response({
          data: { ...mapper(book), image: `${request.url}/shell` },
        })
      );
    } catch (error) {
      throw new Error('Такой книги нет');
    }
  });
  // #endregion

  // #region Получение обложки книги по ID
  server.get('/:id/shell', async (request, reply) => {
    await sendFile('SELECT image FROM book WHERE id = $id', { $id: request.params.id }, reply);
  });
  // #endregion

  // #region Получение PDF книги по ID
  server.get('/:id/pdf', async (request, reply) => {
    await sendFile('SELECT pdf FROM book WHERE id = $id', { $id: request.params.id }, reply);
  });
  // #endregion

  const getLimitedBooks = async (query, request, reply) => {
    const { count } = await db.get('SELECT COUNT(*) AS count FROM book');
    const books = await db.all(query, { $count: request.params['count?'] || 10 });

    let favoritedBooks = [];

    if (request.user) {
      const { favorited } = await db.get('SELECT favorited FROM user WHERE id = $id', {
        $id: request.user.id,
      });

      favoritedBooks = JSON.parse(favorited);
    }

    reply.send(
      response({
        data: {
          total: count,
          list: books.map(book => ({
            ...mapper(book),
            favorited: favoritedBooks.includes(book.id),
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  };

  // #region Получение случайных авторов
  server.get('/random/:count?', async (request, reply) => {
    await getLimitedBooks(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      ORDER BY RANDOM()
      LIMIT $count`,
      request,
      reply
    );
  });
  // #endregion

  // #region Получение популярных книг
  server.get('/popular/:count?', async (request, reply) => {
    await getLimitedBooks(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      ORDER BY book.rating DESC
      LIMIT $count`,
      request,
      reply
    );
  });
  // #endregion

  // #region Получение последних добавленных книг в БД
  server.get('/lastadded/:count?', async (request, reply) => {
    await getLimitedBooks(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      ORDER BY book.id DESC
      LIMIT $count`,
      request,
      reply
    );
  });
  // #endregion

  done();
};
