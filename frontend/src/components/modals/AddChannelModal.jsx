import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { closeModal } from '../../store/modalsSlice.js';
import { useSocket } from '../../hooks/index.js';
import { setCurrentChannelId } from '../../store/channelsSlice.js';
import filterProfanity from '../../utils/filterProfanity.js';
import { toast } from 'react-toastify';   
import './CustomModal.css';

const AddChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocket();
  const inputRef = useRef();

  const channels = useSelector((state) => state.channels.channels);
  const existingChannelNames = channels.map((ch) => ch.name.toLowerCase());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required(t('errors.required'))
        .min(3, t('errors.min', { min: 3 }))
        .max(20, t('errors.max', { max: 20 }))
        .notOneOf(existingChannelNames, t('errors.channelExists')),
    }),
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      const cleanedName = filterProfanity(name.trim());

      socket.emit('newChannel', { name: cleanedName }, (response) => {
        if (response.status === 'ok') {
          dispatch(setCurrentChannelId(response.data.id));
          dispatch(closeModal());
          resetForm();

          toast.success(t('toast.channelCreated'));   
        } else {
          setErrors({ name: t('errors.network') });
        }
        setSubmitting(false);
      });
    },
  });

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h3>{t('modals.add')}</h3>
          <button onClick={() => dispatch(closeModal())} className="close-btn">×</button>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <label>{t('modals.channelName')}</label>
          <input
            ref={inputRef}
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            autoComplete="off"
            className={formik.touched.name && formik.errors.name ? 'input-error' : ''}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="error-text">{formik.errors.name}</div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              disabled={formik.isSubmitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
            >
              {t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChannelModal;
