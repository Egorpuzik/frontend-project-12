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
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* header */}
          <div className="modal-header">
            <h5 className="modal-title">{t('modals.add')}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(closeModal())}
            />
          </div>

          {/* form */}
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-body">
              <label htmlFor="channelName" className="form-label">
                {t('modals.channelName')}
              </label>
              <input
                id="channelName"
                ref={inputRef}
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                disabled={formik.isSubmitting}
                autoComplete="off"
                className={`form-control ${
                  formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback">{formik.errors.name}</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => dispatch(closeModal())}
                disabled={formik.isSubmitting}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
              >
                {t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChannelModal;
