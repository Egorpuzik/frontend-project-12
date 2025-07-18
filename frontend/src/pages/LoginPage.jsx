import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const validationSchema = Yup.object({
    username: Yup.string().required(t('errors.required')),
    password: Yup.string().required(t('errors.required')),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('/api/v1/login', values);
      auth.login(response.data.token); 
      navigate('/');
    } catch {
      setErrors({ submit: t('errors.authFailed') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">{t('login.header')}</h1>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, isSubmitting }) => (
          <Form>
            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            <div className="mb-3">
            <label htmlFor="username">{t('login.username')}</label>
            <Field
              id="username"
              name="username"
              type="text"
              className="form-control"
            />
           <ErrorMessage name="username" component="div" className="text-danger" />
            </div>

            <div className="mb-3">
            <label htmlFor="password">{t('login.password')}</label>
            <Field
              id="password"
              name="password"
              type="password"
              className="form-control"
            />
          <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {t('login.submit')}
            </button>

            <p className="mt-3">
              {t('login.noAccount')} <Link to="/signup">{t('login.signup')}</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;
