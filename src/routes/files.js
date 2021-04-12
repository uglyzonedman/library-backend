import path from 'path';
import { promises as fs, createReadStream } from 'fs';
import mime from 'mime-types';

export default (fastify, options, done) => {
  fastify.get('/*', async (request, reply) => {
    try {
      const filename = path.resolve(process.cwd(), 'public', request.params['*']);
      const stats = await fs.stat(filename);

      if (stats.isFile()) {
        const stream = createReadStream(filename);

        reply.type(mime.lookup(filename)).send(stream);
      } else {
        reply.send(null);
      }
    } catch (error) {
      reply.send(null);
    }
  });

  done();
};
