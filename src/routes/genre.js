import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Получение всех жанров
  server.get('/', async (request, reply) => {
    const genres = await db.all(`SELECT * FROM genre ORDER BY name ASC`);

    reply.send(
      response({
        data: genres.map(genre => mapper(genre)),
      })
    );
  });
  // #endregion

  // #region Получение жанра по ID
  server.get('/:id', async (request, reply) => {
    try {
      const genre = await db.get(
        `SELECT * FROM genre
         WHERE id = $id`,
        { $id: request.params.id }
      );

      reply.send(
        response({
          data: mapper(genre),
        })
      );
    } catch (error) {
      throw new Error('Такой иконки нет');
    }
  });
  // #endregion

  done();
};
