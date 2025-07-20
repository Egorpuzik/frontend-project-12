import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

import loginImage from '../assets/login-image.png';

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
    <div
      className="container d-flex flex-column align-items-center pt-5"
      style={{ marginTop: '250px', minHeight: '100vh' }}
    >
      {/* Основной блок с формой и картинкой */}
      <div
        className="card shadow p-4 d-flex flex-column"
        style={{ width: '750px', height: '450px' }}
      >
        <div className="row g-3 align-items-center flex-grow-1">
          {/* Картинка слева */}
          <div className="col-md-5 text-center">
            <img
              src={loginImage}
              alt="Login"
              className="img-fluid rounded-circle"
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          </div>

          {/* Правая часть с заголовком и формой */}
          <div className="col-md-7 d-flex flex-column">
            <h1 className="mb-4 text-center">{t('login.header')}</h1>

            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="flex-grow-1 d-flex flex-column justify-content-start">
                  {errors.submit && (
                    <div className="alert alert-danger">{errors.submit}</div>
                  )}

                  <div className="form-floating mb-3">
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      placeholder={t('login.username')}
                      className={`form-control ${
                        touched.username && errors.username ? 'is-invalid' : ''
                      }`}
                    />
                    <label htmlFor="username">{t('login.username')}</label>
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-floating mb-3">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder={t('login.password')}
                      className={`form-control ${
                        touched.password && errors.password ? 'is-invalid' : ''
                      }`}
                    />
                    <label htmlFor="password">{t('login.password')}</label>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-outline-primary w-100 mt-auto"
                    disabled={isSubmitting}
                    style={{ fontWeight: '600' }}
                  >
                    {t('login.submit')}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Нижняя рамка с регистрацией, сливается с основной рамкой */}
        <div
          className="border-top d-flex justify-content-center align-items-center"
          style={{
            height: '60px',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 0.375rem 0.375rem',
          }}
        >
          <p className="mb-0">
            {t('login.noAccount')}{' '}
            <Link to="/signup" className="text-decoration-none fw-semibold">
              {t('login.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

