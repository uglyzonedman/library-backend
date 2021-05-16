import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';
import sendFile from '../utils/sendFile.js';

export default (fastify, options, done) => {
  // #region Получение всех авторов
  fastify.get('/', async (request, reply) => {
    const authors = await db.all(`SELECT * FROM author`);

    reply.send(
      response({
        data: authors.map(author => ({
          ...mapper(author),
          image: `${request.url}/${author.id}/portrait`,
        })),
      })
    );
  });
  // #endregion

  // #region Получение автора по ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const author = await db.get(
        `SELECT * FROM author
         WHERE id = $id`,
        { $id: request.params.id }
      );

      reply.send(
        response({
          data: { ...mapper(author), image: `${request.url}/portrait` },
        })
      );
    } catch (error) {
      throw new Error('Такого автора нет');
    }
  });
  // #endregion

  // #region Получение портрета автора по ID
  fastify.get('/:id/portrait', async (request, reply) => {
    await sendFile('SELECT image FROM author WHERE id = $id', { $id: request.params.id }, reply);
  });
  // #endregion

  fastify.get('/random/:count?', async (request, reply) => {
    const { count } = await db.get('SELECT count(*) AS count FROM author');
    const authors = await db.all(
      `SELECT author.id, author.full_name
      FROM author
      ORDER BY RANDOM()
      LIMIT $count`,
      { $count: request.params['count?'] || 10 }
    );

    reply.send(
      response({
        data: {
          total: count,
          list: authors.map(author => ({
            ...mapper(author),
            image: `/api/author/${author.id}/portrait`,
          })),
        },
      })
    );
  });

  done();
};
