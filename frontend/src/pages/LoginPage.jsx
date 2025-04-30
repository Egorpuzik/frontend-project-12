import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const existingUsernames = useSelector((state) =>
    state.channels.channelsList.map((c) => c.name.toLowerCase())
  );

  const validationSchema = Yup.object({
    username: Yup.string()
      .required(t('signup.errors.required'))
      .min(3, t('signup.errors.usernameLength'))
      .max(20, t('signup.errors.usernameLength')),
    password: Yup.string()
      .required(t('signup.errors.required'))
      .min(6, t('signup.errors.passwordLength')),
    confirmPassword: Yup.string()
      .required(t('signup.errors.required'))
      .oneOf([Yup.ref('password')], t('signup.errors.passwordsMustMatch')),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { username, password } = values;
      const response = await axios.post('/api/v1/signup', { username, password });

      auth.logIn(response.data.token);
      navigate('/');
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ username: t('signup.errors.userExists') });
      } else {
        setErrors({ submit: t('signup.errors.serverError') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>{t('signup.header')}</h2>
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors }) => (
          <Form>
            {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

            <div>
              <label htmlFor="username">{t('signup.username')}</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" style={{ color: 'red' }} />
            </div>

            <div>
              <label htmlFor="password">{t('signup.password')}</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" style={{ color: 'red' }} />
            </div>

            <div>
              <label htmlFor="confirmPassword">{t('signup.confirmPassword')}</label>
              <Field name="confirmPassword" type="password" />
              <ErrorMessage name="confirmPassword" component="div" style={{ color: 'red' }} />
            </div>

            <button type="submit">{t('signup.submit')}</button>

            <p>
              {t('signup.haveAccount')} <Link to="/login">{t('signup.login')}</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupPage;
