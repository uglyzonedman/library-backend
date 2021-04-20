import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

export default (fastify, options, done) => {
  fastify.get('/authors', async (request, reply) => {
    const authors = await db.all(
      `SELECT author.id, author.full_name, count(*) AS books_count
      FROM book
      INNER JOIN author
      ON author.id = book.author_id
      WHERE author.full_name LIKE '%' || $author || '%'
      GROUP BY author.id
      ORDER BY  count(*) DESC
      LIMIT $count`,
      { $author: request.query.author || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: authors.map(author => mapper(author)),
      })
    );
  });

  fastify.get('/genre', async (request, reply) => {
    const genres = await db.all(
      `SELECT genre.id, genre.name, count(*) AS books_count
      FROM book
      INNER JOIN genre
      ON genre.id = book.genre_id
      WHERE genre.name LIKE '%' || $genre || '%'
      GROUP BY genre.id
      ORDER BY  count(*) DESC
      LIMIT $count`,
      { $genre: request.query.genre || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: genres.map(genre => mapper(genre)),
      })
    );
  });

  done();
};
