import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Получение списка авторов
  server.get('/authors', async (request, reply) => {
    const authors = await db.all(
      `SELECT author.id, author.full_name, COUNT(*) AS books_count
      FROM book
      INNER JOIN author ON author.id = book.author_id
      WHERE author.full_name LIKE '%' || $author || '%'
      GROUP BY author.id
      ORDER BY COUNT(*) DESC
      LIMIT $count`,
      { $author: request.query.author || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: authors.map(author => mapper(author)),
      })
    );
  });
  // #endregion

  // #region Получение списка жанров
  server.get('/genre', async (request, reply) => {
    const genres = await db.all(
      `SELECT genre.id, genre.name, COUNT(*) AS books_count
      FROM book
      INNER JOIN genre
      ON genre.id = book.genre_id
      WHERE genre.name LIKE '%' || $genre || '%'
      GROUP BY genre.id
      ORDER BY  COUNT(*) DESC
      LIMIT $count`,
      { $genre: request.query.genre || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: genres.map(genre => mapper(genre)),
      })
    );
  });
  // #endregion

  // #region Получение списка языков
  server.get('/languages', async (request, reply) => {
    const languages = await db.all(
      `SELECT language.id, language.name, COUNT(*) AS  books_count
      FROM book
      INNER JOIN language ON language.id = book.language_id
      WHERE language.name LIKE '%' || $language || '%'
      GROUP BY language.id
      ORDER BY COUNT(*) DESC
      LIMIT $count`,
      { $language: request.query.language || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: languages.map(language => mapper(language)),
      })
    );
  });
  // #endregion

  // #region Получение списка возрастных ограничений
  server.get('/ageLimit', async (request, reply) => {
    const ageLimits = await db.all(
      `SELECT age_limit.id, age_limit.age, COUNT(*) AS books_count
      FROM book
      INNER JOIN age_limit ON age_limit.id = book.age_limit_id
      GROUP BY age_limit.id`
    );

    reply.send(
      response({
        data: ageLimits.map(ageLimit => mapper(ageLimit)),
      })
    );
  });
  // #endregion

  // #region Получение минимальной и максимальной дат публикации книг
  server.get('/yearOfPublicaton', async (request, reply) => {
    const yearOfPublicaton = await db.get(
      `SELECT
       MIN(substr (publication_date, 1, 4)) AS min,
       MAX(substr (publication_date, length(publication_date) - 3, length(publication_date))) AS max
       FROM book`
    );

    reply.send(
      response({
        data: mapper(yearOfPublicaton),
      })
    );
  });
  // #endregion

  // #region Получение списка типов контента
  server.get('/typeOfContent', async (request, reply) => {
    const typesOfContent = await db.all(
      `SELECT type_of_content AS id, type_of_content, COUNT(*) AS books_count
      FROM book
      GROUP BY type_of_content
      ORDER BY COUNT(*)`
    );

    reply.send(
      response({
        data: typesOfContent.map(typeOfContent => mapper(typeOfContent)),
      })
    );
  });
  // #endregion

  done();
};
