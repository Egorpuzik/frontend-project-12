import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSelector } from 'react-redux';

const SignupPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const existingUsernames = useSelector((state) =>
    state.channels.channelsList.map((c) => c.name.toLowerCase())
  );

  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Обязательное поле')
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов'),
    password: Yup.string()
      .required('Обязательное поле')
      .min(6, 'Не менее 6 символов'),
    confirmPassword: Yup.string()
      .required('Обязательное поле')
      .oneOf([Yup.ref('password')], 'Пароли должны совпадать'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { username, password } = values;
      const response = await axios.post('/api/v1/signup', { username, password });

      auth.logIn(response.data.token); // сохранить токен
      navigate('/');
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ username: 'Пользователь с таким именем уже существует' });
      } else {
        setErrors({ submit: 'Ошибка регистрации. Попробуйте позже' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

            <div>
              <label htmlFor="username">Имя пользователя</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" style={{ color: 'red' }} />
            </div>

            <div>
              <label htmlFor="password">Пароль</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" style={{ color: 'red' }} />
            </div>

            <div>
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <Field name="confirmPassword" type="password" />
              <ErrorMessage name="confirmPassword" component="div" style={{ color: 'red' }} />
            </div>

            <button type="submit">Зарегистрироваться</button>

            <p>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupPage;
