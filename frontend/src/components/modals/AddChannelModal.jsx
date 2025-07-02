import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { closeModal } from '../../store/modalsSlice.js';

import { useSocket } from '../../hooks/index.js';
import { setCurrentChannelId } from '../../slices/channelsSlice.js';
import filterProfanity from '../../utils/filterProfanity.js';

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
        } else {
          setErrors({ name: t('errors.network') });
        }
        setSubmitting(false);
      });
    },
  });

  return (
    <Modal show centered onHide={() => dispatch(closeModal())}>
      <Modal.Header closeButton>
        <Modal.Title>{t('modals.add')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group controlId="channelName">
            <Form.Label>{t('modals.channelName')}</Form.Label>
            <Form.Control
             ref={inputRef}
             name="name"
             value={formik.values.name}
             onChange={formik.handleChange}
             isInvalid={formik.touched.name && !!formik.errors.name}
             disabled={formik.isSubmitting}
             autoComplete="off"
            />

            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="mt-3 d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={() => dispatch(closeModal())}
              className="me-2"
              disabled={formik.isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={formik.isSubmitting}
            >
              {t('submit')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddChannelModal;
