import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleFill } from 'react-bootstrap-icons';
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

  const renderErrorIcon = () => (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#dc3545',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '0.75px solid #dc3545',
        boxSizing: 'border-box',
        zIndex: 10,
      }}
    >
      <ExclamationCircleFill color="white" size={13} />
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '0 15px' }}>
      <div className="card shadow d-flex flex-column" style={{ width: '750px', height: '450px' }}>
        <div className="row g-3 align-items-center flex-grow-1 px-4 pt-2" style={{ height: '390px', overflow: 'auto' }}>
          <div className="col-md-5 text-center">
            <img
              src={loginImage}
              alt="Login"
              className="img-fluid rounded-circle"
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          </div>

          <div className="col-md-7 d-flex flex-column justify-content-start align-items-center">
            <h1 className="mb-3 mt-1 text-center" style={{ fontSize: '1.8rem', fontWeight: '400' }}>
              {t('login.header')}
            </h1>

            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="w-100 d-flex flex-column align-items-center">

                  {/* Поле username */}
                  <div className="form-floating mb-2 w-75 position-relative" style={{ maxWidth: '350px' }}>
                    <Field name="username">
                      {({ field }) => (
                        <>
                          <input
                            {...field}
                            id="username"
                            type="text"
                            placeholder={t('login.username')}
                            required
                            className={`form-control pe-5 ${((errors.username && touched.username) || errors.submit) ? 'is-invalid' : ''}`}
                          />
                          {((errors.username && touched.username) || errors.submit) && renderErrorIcon()}
                        </>
                      )}
                    </Field>
                    <label htmlFor="username">{t('login.username')}</label>
                    {(errors.username && touched.username) && <div className="invalid-feedback">{errors.username}</div>}
                  </div>

                  {/* Поле password */}
                  <div className="form-floating mb-2 w-75 position-relative" style={{ maxWidth: '350px' }}>
                    <Field name="password">
                      {({ field }) => (
                        <>
                          <input
                            {...field}
                            id="password"
                            type="password"
                            placeholder={t('login.password')}
                            required
                            className={`form-control pe-5 ${((errors.password && touched.password) || errors.submit) ? 'is-invalid' : ''}`}
                          />
                          {((errors.password && touched.password) || errors.submit) && renderErrorIcon()}
                        </>
                      )}
                    </Field>
                    <label htmlFor="password">{t('login.password')}</label>
                    {(errors.password && touched.password) && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  {/* Ошибка авторизации */}
                  {errors.submit && (
                    <div className="invalid-feedback d-block text-center mb-2" style={{ maxWidth: '350px' }}>
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-outline-primary w-75 mt-2"
                    disabled={isSubmitting}
                    style={{ fontWeight: '600', maxWidth: '350px' }}
                  >
                    {t('login.submit')}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <div className="border-top d-flex justify-content-center align-items-center"
          style={{
            height: '60px',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 0.375rem 0.375rem',
            padding: '0 15px',
          }}>
          <p className="mb-0 text-center w-100 text-dark">
            {t('login.noAccount')}{' '}
            <Link to="/signup" className="fw-semibold text-decoration-underline">
              {t('login.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
