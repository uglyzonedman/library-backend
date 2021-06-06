import db from '../database.js';
import { idSchema } from '../models/action.js';
import response from '../utils/response.js';

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Добавляет книгу в избранное
  server.post('/favorite', async (request, reply) => {
    await idSchema.validate(request.body, {
      abortEarly: false,
    });

    const { count } = await db.get('SELECT COUNT(*) AS count FROM book WHERE id = $id', {
      $id: request.body.id,
    });
    if (count !== 0) {
      const { favorited } = await db.get('SELECT favorited FROM user WHERE id = $id', {
        $id: request.user.id,
      });
      const parsed = JSON.parse(favorited);
      const unique = new Set(parsed);
      let message = '';

      if (unique.has(request.body.id)) {
        unique.delete(request.body.id);
        message = 'Книга удалена из избранного';
      } else {
        unique.add(request.body.id);
        message = 'Книга добавлена в избранное';
      }

      await db.run('UPDATE user SET favorited = $encoded WHERE id = $id', {
        $id: request.user.id,
        $encoded: JSON.stringify([...unique]),
      });

      reply.send(
        response({
          message,
        })
      );
    } else {
      reply.send(
        response({
          error: true,
          message: 'Мы не нашли книгу',
        })
      );
    }
  });
  // #endregion

  // #region Добавляет книгу в отложенное
  server.post('/later', async (request, reply) => {
    await idSchema.validate(request.body, {
      abortEarly: false,
    });

    const { count } = await db.get('SELECT COUNT(*) AS count FROM book WHERE id = $id', {
      $id: request.body.id,
    });
    if (count !== 0) {
      const { later } = await db.get('SELECT read_later AS later FROM user WHERE id = $id', {
        $id: request.user.id,
      });
      const parsed = JSON.parse(later);
      const unique = new Set(parsed);
      let message = '';

      if (unique.has(request.body.id)) {
        unique.delete(request.body.id);
        message = 'Книга удалена из отложенных';
      } else {
        unique.add(request.body.id);
        message = 'Книга добавлена в отложенные';
      }

      await db.run('UPDATE user SET read_later = $encoded WHERE id = $id', {
        $id: request.user.id,
        $encoded: JSON.stringify([...unique]),
      });

      reply.send(
        response({
          message,
        })
      );
    } else {
      reply.send(
        response({
          error: true,
          message: 'Мы не нашли книгу',
        })
      );
    }
  });
  // #endregion

  done();
};
