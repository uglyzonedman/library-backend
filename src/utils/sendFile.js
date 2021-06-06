import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import db from '../database.js';

/**
 * @param {string} query
 * @param {Object<string, string>} params
 * @param {import('fastify').FastifyReply} reply
 */
const sendFile = async (query, params, reply) => {
  try {
    const result = await db.get(query, params);
    const file = Object.values(result)[0] || null;
    const filename = path.resolve(process.cwd(), 'src/assets', file);
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
};

export default sendFile;
