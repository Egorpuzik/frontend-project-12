import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../../store/modalsSlice';
import { setCurrentChannelId } from '../../store/channelsSlice';
import { useSocket } from '../../hooks';
import ModalWrapper from './ModalWrapper';

const RemoveChannelModal = ({ channelId }) => {
  const dispatch = useDispatch();
  const socket = useSocket();

  const channels = useSelector((state) => state.channels.channels);
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!channelId) return null;

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

  return (
    <ModalWrapper>
      <div className="modal-dialog" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Удалить канал</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            />
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
    </ModalWrapper>
  );
};

RemoveChannelModal.propTypes = {
  channelId: PropTypes.number,
};

export default RemoveChannelModal;
