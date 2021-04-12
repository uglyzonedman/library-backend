import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';
import sendImage from '../utils/sendImage.js';

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
    await sendImage('SELECT image FROM author WHERE id = $id', { $id: request.params.id }, reply);
  });
  // #endregion

  done();
};
