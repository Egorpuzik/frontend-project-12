import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Channel from './Channel.jsx';
import { setModalType, openModal } from '../store/modalsSlice.js';

const Channels = () => {
  const channels = useSelector((state) => state.channels.channelsList);
  const dispatch = useDispatch();

  const handleAddChannel = () => {
    dispatch(setModalType('adding'));
    dispatch(openModal());
  };

  return (
    <aside className="channels-section border-end bg-light p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold">Channels</span>
        <button
          type="button"
          onClick={handleAddChannel}
          aria-label="Add channel"
          className="btn btn-outline-primary btn-sm"
        >
          +
        </button>
      </div>
      <ul className="list-unstyled">
        {channels.map((channel) => (
          <Channel key={channel.id} channel={channel} />
        ))}
      </ul>
    </aside>
  );
};

export default Channels;
