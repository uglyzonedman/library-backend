import db from '../database.js';
import { signinSchema, signupSchema } from '../models/user.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION);

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {import('fastify').FastifyPluginOptions} options
 * @param {(err?: Error) => void} done
 */
export default (server, options, done) => {
  // #region Регистрация пользлвателя
  server.post('/signup', async (request, reply) => {
    await signupSchema.validate(request.body, {
      abortEarly: false,
    });

    const { count } = await db.get(
      'SELECT COUNT(*) AS count FROM user WHERE LOWER(login) = LOWER($login)',
      { $login: request.body.login }
    );

    if (count === 0) {
      await db.run(
        `INSERT INTO user (name, surname, date_born, login, password, subscribe)
        VALUES ($name, $surname, $date_born, $login, $password, $subscribe)`,
        {
          $name: request.body.name,
          $surname: request.body.surname,
          $date_born: request.body.dateBorn,
          $login: request.body.login,
          $password: request.body.password,
          $subscribe: request.body.subscribe,
        }
      );

      reply.send(response({ message: 'Пользователь создан' }));
    } else {
      reply.send(
        response({
          error: true,
          message: 'Имя данного пользователя уже существует',
        })
      );
    }
  });
  // #endregion

  // #region Вход в систему
  server.post('/signin', async (request, reply) => {
    await signinSchema.validate(request.body, {
      abortEarly: false,
    });

    const user = await db.get('SELECT * FROM user WHERE LOWER(login) = LOWER($login)', {
      $login: request.body.login,
    });
    if (user !== undefined) {
      if (user.password === request.body.password) {
        const payload = {
          exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
          id: user.id,
        };
        const token = server.jwt.sign(payload);

        reply.send(
          response({
            data: {
              user: mapper({
                ...user,
                password: undefined,
              }),
              token,
            },
            message: 'Вы вошли в систему',
          })
        );
      } else {
        reply.send(
          response({
            error: true,
            message: 'Пароли не совпадают',
          })
        );
      }
    } else {
      reply.send(
        response({
          error: true,
          message: 'Такой пользователь не сущесвтует',
        })
      );
    }
  });
  // #endregion

  done();
};
