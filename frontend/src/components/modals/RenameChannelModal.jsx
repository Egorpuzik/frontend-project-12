import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { closeModal } from '../../store/modalsSlice';
import { emitRenameChannel } from '../../sockets/index.js';
import filterProfanity from '../../utils/filterProfanity.js';

const RenameChannelModal = () => {
  const dispatch = useDispatch();
  const { isOpen, channel } = useSelector((state) => state.modals.renameChannelModal);
  const channels = useSelector((state) => state.channels.channels);

  if (!isOpen || !channel) return null;

  const existingNames = channels
    .filter((ch) => ch.id !== channel.id)
    .map((ch) => ch.name);

  const formik = useFormik({
    initialValues: {
      name: channel ? channel.name : '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, 'Имя канала должно содержать минимум 3 символа')
        .max(20, 'Имя канала не может превышать 20 символов')
        .required('Поле обязательно для заполнения')
        .notOneOf(existingNames, 'Такой канал уже существует'),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const cleanedName = filterProfanity(values.name.trim());

      emitRenameChannel({ id: channel.id, name: cleanedName }, () => {
        dispatch(closeModal());
        setSubmitting(false);
        resetForm();
      });
    },
    enableReinitialize: true,
  });

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* header */}
          <div className="modal-header">
            <h5 className="modal-title">Переименовать канал</h5>
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
              <label htmlFor="name" className="form-label">
                Новое имя канала
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-control ${
                  formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoFocus
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
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenameChannelModal;
