import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

export default (fastify, options, done) => {
  fastify.get('/:id', async (request, reply) => {
    try {
      const book = await db.get(
        `SELECT book.id, book.name, book.price, shell.name as shell, author.full_name as author, genre.name as genre, book.publication_date, book.rating, language.name as language, age_limit.age as age_limit, book.type_of_content, book.number_of_pages, book.description
      FROM book
      INNER JOIN shell ON book.shell_id = shell.id
      INNER JOIN author ON book.author_id = author.id
      INNER JOIN genre ON book.genre_id = genre.id
      INNER JOIN language ON book.language_id = language.id
      INNER JOIN age_limit ON book.age_limit_id = age_limit.id
      WHERE book.id = $id`,
        {
          $id: request.params.id,
        }
      );

      reply.send(
        response({
          data: { ...mapper(book), image: `${request.url}/shell` },
        })
      );
    } catch (error) {
      throw new Error('Такой книги нет');
    }
  });

  fastify.get('/:id/shell', async (request, reply) => {
    try {
      const { image } = await db.get('SELECT image FROM book WHERE id = $id', {
        $id: request.params.id,
      });
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
  });

  done();
};
