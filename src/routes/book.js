import db from '../database.js';
// import response from '../utils/response.js';

export default (fastify, options, done) => {
  fastify.get('/:id', async (request, reply) => {
    await db.get(
      'SELECT book.id,book.name,book.price,shell.name,author.full_name,genre.name,book.publication_date,book.rating,language.name,age_limit.age,book.type_of_content,book.number_of_pages,book.image,book.description FROM book INNER JOIN shell on book.shell_id = shell.id INNER JOIN author on book.author_id = author.id INNER JOIN genre on book.genre_id = genre.id INNER JOIN language on book.language_id = language.id INNER JOIN age_limit on book.age_limit_id = age_limit.id'
    );
    reply.send(request.params);
  });
  done();
};
