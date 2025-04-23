import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; 

const validationSchema = Yup.object({
  username: Yup.string().required('Обязательное поле'),
  password: Yup.string().required('Обязательное поле'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuth(); 

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('/api/v1/login', values);
      auth.logIn(response.data.token);
      navigate('/');
    } catch (error) {
      setErrors({ auth: 'Неверные имя пользователя или пароль' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Вход в чат</h2>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors }) => (
          <Form>
            {errors.auth && <div style={{ color: 'red' }}>{errors.auth}</div>}

            <div>
              <label htmlFor="username">Имя пользователя</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" />
            </div>

            <div>
              <label htmlFor="password">Пароль</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" />
            </div>

            <button type="submit">Войти</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;
