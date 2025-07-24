import React from 'react';
import { useTranslation } from 'react-i18next';
import SignupForm from '../components/SignupForm.jsx';
import signupImage from '../assets/signup-image.png';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="bg-white w-100 border-bottom py-2 px-4 d-flex align-items-center">
        <Link
          to="/"
          className="text-decoration-none text-dark fs-4"
          style={{ fontWeight: 'normal' }}
        >
          Hexlet Chat
        </Link>
      </div>

      <div className="flex-grow-1 d-flex justify-content-center align-items-center px-3 py-5">
        <div
          className="card shadow p-4 d-flex flex-column justify-content-center"
          style={{ width: '750px', height: '480px' }}
        >
          <div className="row g-0 align-items-center h-100">
            <div className="col-md-5 text-center mb-4 mb-md-0">
              <img
                src={signupImage}
                alt="Signup"
                className="img-fluid rounded-circle"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </div>

            <div className="col-md-7 d-flex flex-column align-items-center">
              {/* Центрированный и жирный заголовок */}
              <h1 className="mb-4 fw-bold text-center" style={{ fontSize: '3rem', fontWeight: '400' }}>
                {t('signup.header')}
              </h1>

              {/* Обертка формы с фиксированной шириной */}
              <div style={{ width: '100%', maxWidth: '320px' }}>
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
