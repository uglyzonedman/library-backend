import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import db from '../database.js';

const sendImage = async (query, params, reply) => {
  try {
    const { image } = await db.get(query, params);
    const filename = path.resolve(process.cwd(), 'src/assets', image);
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

export default sendImage;
