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
      name: channel.name,
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
  });

  return (
    <div className="modal">
      <h3>Переименовать канал</h3>
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor="name">Новое имя канала</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoFocus
        />
        {formik.touched.name && formik.errors.name && <div>{formik.errors.name}</div>}
        <button type="submit" disabled={formik.isSubmitting}>
          Сохранить
        </button>
        <button type="button" onClick={() => dispatch(closeModal())}>
          Отмена
        </button>
      </form>
    </div>
  );
};

export default RenameChannelModal;
