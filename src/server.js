import fastify from 'fastify';
import cors from 'fastify-cors';
import jwt from 'fastify-jwt';
import { ValidationError } from 'yup';
import user from './routes/user.js';
import book from './routes/book.js';
import author from './routes/author.js';
import genre from './routes/genre.js';
import dictionary from './routes/dictionary.js';
import search from './routes/search.js';
import profile from './routes/profile.js';
import action from './routes/action.js';
import response from './utils/response.js';

const server = fastify({
  ignoreTrailingSlash: true,
  logger: {
    prettyPrint: true,
  },
});

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
    request.log.error(error);
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

server.register(
  (server, options, done) => {
    server.register((server, options, done) => {
      server.addHook('onRequest', async request => {
        try {
          await request.jwtVerify();
        } catch (error) {} // eslint-disable-line no-empty
      });

      server.register(user, { prefix: '/user' });
      server.register(book, { prefix: '/book' });
      server.register(author, { prefix: '/author' });
      server.register(genre, { prefix: '/genre' });
      server.register(dictionary, { prefix: '/dictionary' });
      server.register(search, { prefix: '/search' });

      done();
    });

    server.register((server, options, done) => {
      server.addHook('onRequest', async request => await request.jwtVerify());

      server.register(profile, { prefix: '/profile' });
      server.register(action, { prefix: '/action' });

      done();
    });

    done();
  },
  { prefix: '/api' }
);

server.listen(process.env.PORT, process.env.HOSTNAME);
