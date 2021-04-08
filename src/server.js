import fastify from 'fastify';
import cors from 'fastify-cors';
import jwt from 'fastify-jwt';
import { ValidationError } from 'yup';
import files from './routes/files.js';
import user from './routes/user.js';
import book from './routes/book.js';
import response from './utils/response.js';

const server = fastify();

server.setErrorHandler((error, request, reply) => {
  if (error instanceof ValidationError) {
    const errors = Object.fromEntries(error.inner.map(error => [error.path, error.message]));
    reply.send(
      response({
        error: true,
        data: errors,
        message: 'Произошла ошибка валидации',
      })
    );
  } else {
    reply.send(
      response({
        error: true,
        message: error.message,
      })
    );
  }
});

server.setNotFoundHandler(
  {
    preValidation: (request, reply, done) => done(),
    preHandler: (request, reply, done) => done(),
  },
  (request, reply) => {
    reply.send(
      response({
        error: true,
        message: 'Страница не найдена',
      })
    );
  }
);

server.register(cors);
server.register(jwt, {
  secret: process.env.SECRET,
});
server.decorate('authentificate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.send(
      response({
        error: true,
        message: error.message,
      })
    );
  }
});

server.register(
  (fastify, options, done) => {
    fastify.register(files, { prefix: '/files' });
    fastify.register(user, { prefix: '/user' });
    fastify.register(book, { prefix: '/book' });

    done();
  },
  { prefix: '/api' }
);

server.listen(process.env.PORT, process.env.HOSTNAME, (error, address) => {
  if (!error) {
    console.log(`Сервер запущен по адресу ${address}`);
  }
});

//fastify.get(
// 	'/',
// 	{
// 	  preValidation: [fastify.authentificate],
// 	},
// 	(request, reply) => {
// 	  reply.send(request.user);
// 	}
//  );
