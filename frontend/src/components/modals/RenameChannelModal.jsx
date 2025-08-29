import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { closeModal } from '../../store/modalsSlice';
import { useSocket } from '../../hooks';
import filterProfanity from '../../utils/filterProfanity';
import { toast } from 'react-toastify';

const RenameChannelModal = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const inputRef = useRef();

  const { isOpen, type, channelId } = useSelector((state) => state.modals);
  const channels = useSelector((state) => state.channels.channels);

  if (!isOpen || type !== 'renaming' || channelId == null) return null;

  const channel = channels.find((ch) => ch.id === channelId);
  if (!channel) return null;

  const existingNames = channels
    .filter((ch) => ch.id !== channel.id)
    .map((ch) => ch.name.toLowerCase());

  useEffect(() => {
    inputRef.current?.focus();
  }, [isOpen]);

  const formik = useFormik({
    initialValues: { name: channel.name },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .notOneOf(existingNames, 'Такое имя уже существует'),
    }),
    onSubmit: ({ name }, { setSubmitting, resetForm, setErrors }) => {
      const cleanedName = filterProfanity(name.trim());

      socket.emit('renameChannel', { id: channel.id, name: cleanedName }, (response) => {
        if (response.status === 'ok') {
          toast.success('Канал переименован');
          dispatch(closeModal());
          resetForm();
        } else {
          setErrors({ name: 'Ошибка сети' });
        }
        setSubmitting(false);
      });
    },
    enableReinitialize: true,
  });

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: '500px', width: '100%' }} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Переименовать канал</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch(closeModal())}
              disabled={formik.isSubmitting}
            />
          </div>
          <div className="modal-body">
            <form onSubmit={formik.handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="channelName" className="form-label">
                  Имя канала
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
                  autoComplete="off"
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
                  Отменить
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                >
                  Сохранить
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
