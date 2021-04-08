import db from '../database.js';
import { signinSchema, signupSchema } from '../validations/user.js';
import response from '../utils/response.js';

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION);

export default (fastify, options, done) => {
  fastify.post('/signup', async (request, reply) => {
    await signupSchema.validate(request.body, {
      abortEarly: false,
    });
    const { count } = await db.get(
      'Select count(*) as count from user where lower(login) = lower($login)',
      {
        $login: request.body.login,
      }
    );
    if (count === 0) {
      await db.run(
        'INSERT INTO user (name,surname,date_born,login,password,subscribe) values ($name,$surname,$date_born,$login,$password,$subscribe)',
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

  fastify.post('/signin', async (request, reply) => {
    await signinSchema.validate(request.body, {
      abortEarly: false,
    });

    const user = await db.get('SELECT * FROM user WHERE lower(login)=lower($login)', {
      $login: request.body.login,
    });
    if (user.password === request.body.password) {
      const payload = {
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
        login: user.login,
        id: user.id,
      };
      const token = fastify.jwt.sign(payload);
      reply.send(
        response({
          data: {
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
  });
  done();
};
