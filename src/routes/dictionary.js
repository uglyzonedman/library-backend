import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

//#region получение 5 авторов в блок фильрации
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
  //#endregion

  //#region получение 5 жанров в блок фильтрации
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
  //#endregion

  //#region получение 5 языков в блок фильтрации
  fastify.get('/languages', async (request, reply) => {
    const languages = await db.all(
      `SELECT language.id, language.name, count(*) AS  books_count
      FROM book
      INNER JOIN language
      ON language.id = book.language_id
      WHERE language.name LIKE '%' || $language || '%'
      GROUP BY language.id
      ORDER BY count(*) DESC
      LIMIT $count`,
      { $language: request.query.language || '', $count: request.query.count || 5 }
    );

    reply.send(
      response({
        data: languages.map(language => mapper(language)),
      })
    );
  });
  //#endregion

  //#region получение возрастных ограничений в блок фильтрации
  fastify.get('/ageLimit', async (request, reply) => {
    const ageLimits = await db.all(
      `SELECT age_limit.id, age_limit.age, count(*) AS books_count
      FROM book
      INNER JOIN age_limit
      ON age_limit.id = book.age_limit_id
      GROUP BY age_limit.id`
    );

    reply.send(
      response({
        data: ageLimits.map(ageLimit => mapper(ageLimit)),
      })
    );
  });
  //#endregion

  //#region получение минимальной и максимальной даты публикации в блок фильтрации
  fastify.get('/yearOfPublicaton', async (request, reply) => {
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
  //#endregion

  done();
};
