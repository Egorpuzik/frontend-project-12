import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/modalsSlice';
import { removeChannel, setCurrentChannelId } from '../../store/channelsSlice';

const RemoveChannelModal = () => {
  const dispatch = useDispatch();
  const { isOpen, channel } = useSelector((state) => state.modals.removeChannelModal);
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!isOpen || !channel) return null;

  const handleRemove = () => {
    dispatch(removeChannel(channel.id));

    if (channel.id === currentChannelId) {
      dispatch(setCurrentChannelId(1));
    }

    dispatch(closeModal());
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* header */}
          <div className="modal-header">
            <h5 className="modal-title">Удалить канал</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(closeModal())}
            />
          </div>

          {/* body */}
          <div className="modal-body">
            <p>
              Вы уверены, что хотите удалить канал "<b>{channel.name}</b>"?
            </p>
          </div>

          {/* footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dispatch(closeModal())}
            >
              Отмена
            </button>
            <button type="button" className="btn btn-danger" onClick={handleRemove}>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveChannelModal;
