import * as yup from 'yup';

export const signupSchema = yup.object().shape({
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

export const signinSchema = yup.object().shape({
  login: yup.string().required('Обязательное поле логин'),
  password: yup
    .string()
    .min(8, 'Минимальное кол-во 8 символов')
    .required('Обязательное поле пароль'),
});
