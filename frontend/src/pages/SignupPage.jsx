import React from 'react';
import { useTranslation } from 'react-i18next';
import SignupForm from '../components/SignupForm.jsx';

const SignupPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mt-5">
      <h1 className="mb-4">{t('signup.header')}</h1>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
