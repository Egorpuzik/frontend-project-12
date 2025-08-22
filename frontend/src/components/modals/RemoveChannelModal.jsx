import React from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../../store/modalsSlice';
import { setCurrentChannelId } from '../../store/channelsSlice';
import { useSocket } from '../../hooks';

const modalRoot = document.getElementById('modal-root');

const RemoveChannelModal = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  const { isOpen, channel } = useSelector((state) => state.modals.removeChannelModal);
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!isOpen || !channel) return null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleRemove = () => {
    socket.emit('removeChannel', { id: channel.id }, (response) => {
      if (response.status === 'ok') {
        if (channel.id === currentChannelId) {
          dispatch(setCurrentChannelId(1));
        }
        handleClose();
        toast.success('Канал удалён');
      } else {
        toast.error('Ошибка сети');
      }
    });
  };

  const modal = (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Удалить канал</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Закрыть"
              onClick={handleClose}
            />
          </div>
          <div className="modal-body">
            <p>Вы уверены, что хотите удалить канал «{channel.name}»?</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Отменить
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleRemove}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(modal, modalRoot) : modal;
};

export default RemoveChannelModal;
