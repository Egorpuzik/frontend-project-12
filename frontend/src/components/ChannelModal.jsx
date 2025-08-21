import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const ChannelModal = ({ type, channel, channels, onClose, onSubmit, onDelete }) => {
  const isEdit = type === 'rename';

  const formik = useFormik({
    initialValues: { name: isEdit && channel ? channel.name : '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .test('unique', 'Такой канал уже существует', (value) => {
          if (!value) return false;
          const existing = channels.map((c) => c.name.toLowerCase());
          if (isEdit) {
            existing.splice(existing.indexOf(channel.name.toLowerCase()), 1);
          }
          return !existing.includes(value.toLowerCase());
        }),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async ({ name }, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(name.trim(), channel);
      } catch (err) {
        console.error('Ошибка добавления/переименования канала:', err);
        setErrors({ name: 'Ошибка соединения' });
        toast.error('Ошибка соединения');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    formik.resetForm();
  }, [channel, isEdit]);

  const handleDelete = async () => {
    if (!channel) return;
    toast.dismiss();
    try {
      await onDelete(channel);
    } finally {
      onClose();
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Переименовать канал' : 'Добавить канал'}</h5>
            <button type="button" className="btn-close" aria-label="Закрыть" onClick={onClose} />
          </div>
          <div className="modal-body">
            <form onSubmit={formik.handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="channelName" className="form-label">Имя канала</label>
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
                    formik.errors.name && (formik.touched.name || formik.submitCount > 0) ? 'is-invalid' : ''
                  }`}
                />
                {formik.errors.name && (formik.touched.name || formik.submitCount > 0) && (
                  <div className="invalid-feedback d-block">{formik.errors.name}</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={onClose} className="btn btn-secondary">Отменить</button>
                {isEdit && channel && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                  {isEdit ? 'Переименовать' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelModal;
