import React, { useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/modalsSlice';
import { useSocket } from '../../hooks';
import { setCurrentChannelId } from '../../store/channelsSlice';
import filterProfanity from '../../utils/filterProfanity';
import { toast } from 'react-toastify';
import ModalWrapper from './ModalWrapper';

const AddChannelModal = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const inputRef = useRef();

  const channels = useSelector((state) => state.channels.channels);
  const existingChannelNames = channels.map((ch) => ch.name.toLowerCase());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов')
      .required('Обязательное поле')
      .notOneOf(existingChannelNames, 'Такой канал уже существует'),
  });

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema,
    onSubmit: ({ name }, { setSubmitting, setErrors, resetForm }) => {
      const cleanedName = filterProfanity(name.trim());

      socket.emit('newChannel', { name: cleanedName }, (response) => {
        if (response.status === 'ok') {
          dispatch(setCurrentChannelId(response.data.id));
          dispatch(closeModal());
          resetForm();
          toast.success('Канал создан');
        } else {
          setErrors({ name: 'Ошибка сети' });
        }
        setSubmitting(false);
      });
    },
  });

  return (
    <ModalWrapper>
      <div className="modal-dialog" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Добавить канал</h5>
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
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddChannelModal;
