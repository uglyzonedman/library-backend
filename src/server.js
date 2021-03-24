import fastify from 'fastify';
import cors from 'fastify-cors';
import jwt from 'fastify-jwt';
import files from './routes/files.js';
import user from './routes/user.js';
import response from './utils/response.js';

const server = fastify();
server.setErrorHandler((error, request, reply) => {
  reply.send(response(null, error.message));
});
server.setNotFoundHandler(
  {
    preValidation: (request, reply, done) => done(),
    preHandler: (request, reply, done) => done(),
  },
  (request, reply) => {
    reply.send(response(null, 'Страница не найдена'));
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
    reply.send(response(null, error.message));
  }
});

server.register(
  (instance, options, done) => {
    instance.register(files, { prefix: '/files' });
    instance.register(user, { prefix: '/user' });

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
