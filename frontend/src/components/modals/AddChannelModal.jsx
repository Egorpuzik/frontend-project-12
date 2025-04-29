import React from 'react';  
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { closeModal } from '../../store/modalsSlice'; 
import { emitNewChannel } from '../../sockets/index.js'; 
import { setCurrentChannelId } from '../../store/channelsSlice.js'; 

const AddChannelModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modals.addChannelModal.isOpen);
  const channels = useSelector((state) => state.channels.channels); 

  const channelNames = channels.map((ch) => ch.name);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(3, 'Имя канала должно содержать минимум 3 символа')
        .max(20, 'Имя канала не может превышать 20 символов')
        .required('Поле обязательно для заполнения')
        .notOneOf(channelNames, 'Такой канал уже существует'), 
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const trimmedName = values.name.trim();
      emitNewChannel({ name: trimmedName }, (newChannel) => {
        dispatch(setCurrentChannelId(newChannel.id)); 
        dispatch(closeModal());
        setSubmitting(false);
        resetForm();
      });
    },
  });

  if (!isOpen) return null; 

  return (
    <div className="modal">
      <h3>Добавить канал</h3>
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor="name">Имя канала</label>
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
          Создать канал
        </button>
        <button type="button" onClick={() => dispatch(closeModal())}>
          Отмена
        </button>
      </form>
    </div>
  );
};

export default AddChannelModal;
