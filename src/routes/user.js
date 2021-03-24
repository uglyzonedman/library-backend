import * as yup from 'yup';
import db from '../database.js';
import response from '../utils/response.js';

const SESSION_DURATION = parseInt(process.env.SESSION_DURATION);
const signupSchema = yup.object().shape({
  name: yup.string().required('Обязательное поле имя'),
  surname: yup.string().required('Обязательное поле фамилия'),
  dateBorn: yup.string().required('Обязательное поле дата'),
  login: yup.string().required('Обязательное поле логин'),
  password: yup
    .string()
    .min(8, 'Минимальное кол-во 8 символов')
    .required('Обязательное поле пароль'),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Пароли не совпадают')
    .required('Обязательное поле повторить пароль'),
  subscribe: yup.bool().required('Обязательное поле подписка'),
});

export default (fastify, options, done) => {
  fastify.post('/signup', async (request, reply) => {
    signupSchema.validateSync(request.body);
    const { count } = await db.get(
      'Select count(*) as count from user where lower(login) = lower($login)',
      {
        $login: request.body.login,
      }
    );
    if (count === 0) {
      const { lastID } = await db.run(
        'INSERT INTO user (name,surname,date_born,login,password,subscribe) values ($name,$surname,$date_born,$login,$password,$subscribe)',
        {
          $name: request.body.name,
          $surname: request.body.surname,
          $date_born: request.body.dateBorn,
          $login: request.body.login,
          $password: request.body.password,
          $subscribe: request.body.subscribe,
        }
      );
      const payload = {
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
        login: request.body.login,
        id: lastID,
      };
      const token = fastify.jwt.sign(payload);
      reply.send(response(token));
    } else {
      reply.send(response(null, 'Данное имя пользователя уже занято'));
    }
  });

  done();
};
