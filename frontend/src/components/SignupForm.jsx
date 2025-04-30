import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const SignupForm = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле'),
      password: Yup.string()
        .min(6, 'Не менее 6 символов')
        .required('Обязательное поле'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
        .required('Обязательное поле'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const res = await axios.post('/api/v1/signup', {
          username: values.username,
          password: values.password,
        });

        auth.login(res.data);
        navigate('/');
      } catch (err) {
        if (err.response?.status === 409) {
          setErrors({ username: 'Пользователь уже существует' });
        } else {
          console.error(err);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-3">
        <label htmlFor="username">Имя пользователя</label>
        <input
          id="username"
          name="username"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.username}
          className="form-control"
        />
        {formik.touched.username && formik.errors.username && (
          <div className="text-danger">{formik.errors.username}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          className="form-control"
        />
        {formik.touched.password && formik.errors.password && (
          <div className="text-danger">{formik.errors.password}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword">Подтвердите пароль</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          className="form-control"
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="text-danger">{formik.errors.confirmPassword}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
        Зарегистрироваться
      </button>
    </form>
  );
};

export default SignupForm;
