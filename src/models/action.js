import * as yup from 'yup';

export const idSchema = yup.object().shape({
  id: yup.number().required('ID обязателен'),
});
