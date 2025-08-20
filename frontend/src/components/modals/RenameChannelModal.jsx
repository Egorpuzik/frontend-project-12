import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { closeModal } from '../../store/modalsSlice';
import { useSocket } from '../../hooks';
import filterProfanity from '../../utils/filterProfanity';
import { toast } from 'react-toastify';

const RenameChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocket();
  const inputRef = useRef();

  const { isOpen, channel } = useSelector((state) => state.modals.renameChannelModal);
  const channels = useSelector((state) => state.channels.channels);

  const existingNames = channel
    ? channels.filter((ch) => ch.id !== channel.id).map((ch) => ch.name.toLowerCase())
    : [];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const formik = useFormik({
    initialValues: {
      name: channel ? channel.name : '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, t('errors.min', { min: 3, max: 20 }))
        .max(20, t('errors.min', { min: 3, max: 20 }))
        .required(t('errors.required'))
        .notOneOf(existingNames, t('errors.uniq')),
    }),
    onSubmit: ({ name }, { setSubmitting, resetForm, setErrors }) => {
      const cleanedName = filterProfanity(name.trim());

      socket.emit('renameChannel', { id: channel.id, name: cleanedName }, (response) => {
        if (response.status === 'ok') {
          toast.success(t('toast.channelRenamed'));
          dispatch(closeModal());
          resetForm();
        } else {
          setErrors({ name: t('toast.networkError') });
        }
        setSubmitting(false);
      });
    },
    enableReinitialize: true,
  });

  if (!isOpen || !channel) {
    return null;
  }

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('modals.rename.header')}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(closeModal())}
              disabled={formik.isSubmitting}
            />
          </div>
          <div className="modal-body">
            <form onSubmit={formik.handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="channelName" className="form-label">
                  {t('channelName')}
                </label>
                <input
                  id="channelName"
                  ref={inputRef}
                  name="name"
                  type="text"
                  className={`form-control ${
                    formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                  }`}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
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
                  {t('modals.rename.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                >
                  {t('modals.rename.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameChannelModal;
