import db from '../database.js';
import mapper from '../utils/mapper.js';
import response from '../utils/response.js';

const join = values => values.join(', ');

export default (fastify, options, done) => {
  //#region Простой поиск
  fastify.get('/', async (request, reply) => {
    const entries = await db.all(
      `
      SELECT
        book.id,
        book.name,
        author.full_name AS author,
        genre.name AS genre
      FROM book
      INNER JOIN author ON author.id = book.author_id
      INNER JOIN genre ON genre.id = book.genre_id
      WHERE book.name LIKE '%' || $needle || '%'
    `,
      {
        $needle: request.query.needle || '',
      }
    );
    reply.send(
      response({
        data: entries.map(entry => ({
          ...entry,
          image: `/api/book/${entry.id}/shell`,
        })),
      })
    );
  });
  //#endregion

  //#region получение книг через поиск
  fastify.post('/books', async (request, reply) => {
    const conditions = [];
    const {
      authors = [],
      genres = [],
      ageLimits = [],
      languages = [],
      typeOfContent = [],
      publicationDateFrom = null,
      publicationDateTo = null,
    } = request.body;

    if (authors.length > 0) {
      conditions.push(`author_id IN (${join(authors)})`);
    }
    if (genres.length > 0) {
      conditions.push(`genre_id IN (${join(genres)})`);
    }
    if (ageLimits.length > 0) {
      conditions.push(`age_limit_id IN (${join(ageLimits)})`);
    }
    if (languages.length > 0) {
      conditions.push(`language_id IN (${join(languages)})`);
    }
    if (typeOfContent.length > 0) {
      conditions.push(`type_of_content IN (${join(typeOfContent)})`);
    }
    if (publicationDateFrom) {
      conditions.push(`CAST(SUBSTR(publication_date, 1, 4) AS INTEGER) >= ${publicationDateFrom}`);
    }
    if (publicationDateTo) {
      conditions.push(
        `CAST(SUBSTR(publication_date, length(publication_date) - 3, length(publication_date))) AS INTEGER) <= ${publicationDateTo}`
      );
    }
    let query = `
      SELECT
        book.id,
        book.name,
        book.price,
        shell.name as shell,
        author.full_name as author,
        genre.name as genre,
        book.publication_date,
        book.rating,
        language.name as language,
        age_limit.age as age_limit,
        book.type_of_content,
        book.number_of_pages,
        book.description
      FROM book
      INNER JOIN shell
        ON book.shell_id = shell.id
      INNER JOIN author
        ON book.author_id = author.id
      INNER JOIN genre
        ON book.genre_id = genre.id
      INNER JOIN language
        ON book.language_id = language.id
      INNER JOIN age_limit
        ON book.age_limit_id = age_limit.id
    `;
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const { total } = await db.get(`SELECT count(*) AS total FROM (${query})`);

    query += ' LIMIT $count OFFSET $offset';
    const count = parseInt(request.query.count) || 10;
    const page = parseInt(request.query.page) || 0;
    const books = await db.all(query, {
      $count: count,
      $offset: page * count,
    });

    reply.send(
      response({
        data: {
          total,
          list: books.map(book => ({
            ...mapper(book),
            image: `/api/book/${book.id}/shell`,
          })),
        },
      })
    );
  });
  //#endregion

  done();
};
