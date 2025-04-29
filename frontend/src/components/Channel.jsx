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

  const buttonClass = cn('channel-button', {
    'active-channel': channel.id === currentChannelId,
  });

  return (
    <li className="d-flex justify-content-between align-items-center mb-1">
      <button
        type="button"
        onClick={handleSelect}
        className={buttonClass}
      >
        # {channel.name}
      </button>
      {channel.removable && <ChannelsMenu channel={channel} />}
    </li>
  );
};

export default Channel;

