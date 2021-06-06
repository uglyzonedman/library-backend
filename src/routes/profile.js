import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Список избранных книг пользователя
  server.get('/favorite', async (request, reply) => {
    const { favorited } = await db.get('SELECT favorited FROM user WHERE id = $id', {
      $id: request.user.id,
    });
    const parsed = JSON.parse(favorited);
    const count = parseInt(request.query.count) || 10;
    const page = parseInt(request.query.page) || 0;
    const books = await db.all(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      WHERE book.id IN (${parsed.join(', ')})
      LIMIT $count OFFSET $offset`,
      {
        $count: count,
        $offset: page * count,
      }
    );

    reply.send(
      response({
        data: {
          total: parsed.length,
          list: books.map(book => ({
            ...mapper(book),
            favorited: true,
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  });
  // #endregion

  // #region Список отложенных книг пользователя
  server.get('/later', async (request, reply) => {
    const { later } = await db.get('SELECT read_later AS later FROM user WHERE id = $id', {
      $id: request.user.id,
    });
    const parsed = JSON.parse(later);
    const count = parseInt(request.query.count) || 10;
    const page = parseInt(request.query.page) || 0;
    const books = await db.all(
      `SELECT book.id, book.name, author.full_name AS author, book.rating
      FROM book
      INNER JOIN author ON book.author_id = author.id
      WHERE book.id IN (${parsed.join(', ')})
      LIMIT $count OFFSET $offset`,
      {
        $count: count,
        $offset: page * count,
      }
    );

    reply.send(
      response({
        data: {
          total: parsed.length,
          list: books.map(book => ({
            ...mapper(book),
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  });
  // #endregio

  done();
};
