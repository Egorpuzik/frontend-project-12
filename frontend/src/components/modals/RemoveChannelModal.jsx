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

  const { isOpen, type, channelId } = useSelector((state) => state.modals);
  const channels = useSelector((state) => state.channels.channels);
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!isOpen || type !== 'removing' || channelId == null) return null;

  const channel = channels.find((ch) => ch.id === channelId);
  if (!channel) return null;

  const handleClose = () => dispatch(closeModal());

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
            <h5 className="modal-title">Удалить канал</h5>
            <button type="button" className="btn-close" onClick={handleClose} />
          </div>
          <div className="modal-body">
            <p>Вы уверены, что хотите удалить канал «{channel.name}»?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Отменить
            </button>
            <button type="button" className="btn btn-danger" onClick={handleRemove}>
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
