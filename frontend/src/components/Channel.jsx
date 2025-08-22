import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentChannelId } from '../store/channelsSlice.js';
import ChannelsMenu from './ChannelsMenu.jsx';
import cn from 'classnames';

const Channel = ({ channel }) => {
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);
  const dispatch = useDispatch();

  const handleSelect = () => {
    dispatch(setCurrentChannelId(channel.id));
  };

  const buttonClass = cn(
    'w-100 rounded-0 text-start btn',
    {
      'btn-secondary': channel.id === currentChannelId,
      'btn-light': channel.id !== currentChannelId,
    },
  );

  return (
    <li className="nav-item w-100">
      <div className="d-flex dropdown btn-group w-100">
        <button
          type="button"
          onClick={handleSelect}
          className={buttonClass}
        >
          <span className="me-1">#</span>
          {channel.name}
        </button>
        {channel.removable && <ChannelsMenu channel={channel} />}
      </div>
    </li>
  );
};

export default Channel;
