import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { closeModal } from '../../store/modalsSlice';
import { useSocket } from '../../hooks';
import { setCurrentChannelId } from '../../store/channelsSlice';
import { toast } from 'react-toastify';

const RemoveChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { isOpen, channel } = useSelector((state) => state.modals.removeChannelModal);
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!isOpen || !channel) return null;

  const handleRemove = () => {
    socket.emit('removeChannel', { id: channel.id }, (response) => {
      if (response.status === 'ok') {
        if (channel.id === currentChannelId) {
          dispatch(setCurrentChannelId(1)); 
        }
        toast.success(t('toast.channelRemoved'));
        dispatch(closeModal());
      } else {
        toast.error(t('toast.networkError'));
      }
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('modals.remove.header')}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(closeModal())}
            />
          </div>
          <div className="modal-body">
            <p>{t('modals.remove.body')}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dispatch(closeModal())}
            >
              {t('modals.remove.cancel')}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleRemove}>
              {t('modals.remove.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveChannelModal;
