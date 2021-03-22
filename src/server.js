import fastify from 'fastify';
import cors from 'fastify-cors';
import db from './database.js';
import files from './routes/files.js';
import response from './utils/response.js';

const server = fastify();

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

server.register(
  (instance, options, done) => {
    instance.register(files, { prefix: '/files' });

    instance.get('/', async (request, reply) => {
      const data = await db.all('SELECT * from test');
      reply.send(response(data));
    });

    done();
  },
  { prefix: '/api' }
);

server.listen(process.env.PORT, process.env.HOSTNAME, (error, address) => {
  if (!error) {
    console.log(`Сервер запущен по адресу ${address}`);
  }
});
