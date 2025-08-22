import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;

const ChannelModal = ({ type, channel, channels, onClose, onSubmit }) => {
  const isRename = type === 'rename';

  const formik = useFormik({
    initialValues: { name: isRename && channel ? channel.name : '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .test('unique', 'Такой канал уже существует', (value) => {
          if (!value) return false;
          const list = channels.map((c) => c.name.toLowerCase());

          if (isRename && channel) {
            const idx = list.indexOf(channel.name.toLowerCase());
            if (idx !== -1) list.splice(idx, 1);
          }
          return !list.includes(value.toLowerCase());
        }),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async ({ name }, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(name.trim(), isRename ? channel : null);
      } catch (e) {
        console.error('Ошибка добавления/переименования канала:', e);
        setErrors({ name: 'Ошибка соединения' });
        toast.error('Ошибка соединения');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    formik.resetForm({
      values: { name: isRename && channel ? channel.name : '' },
    });
  }, [isRename, channel?.id]);

  const modal = (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isRename ? 'Переименовать канал' : 'Добавить канал'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Закрыть"
              onClick={onClose}
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
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Введите имя канала"
                  autoFocus
                  className={`form-control ${
                    formik.errors.name &&
                    (formik.touched.name || formik.submitCount > 0)
                      ? 'is-invalid'
                      : ''
                  }`}
                />
                {formik.errors.name &&
                  (formik.touched.name || formik.submitCount > 0) && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.name}
                    </div>
                  )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formik.isSubmitting}
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(modal, modalRoot) : modal;
};

export default ChannelModal;
