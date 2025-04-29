import React from 'react';
import { useDispatch } from 'react-redux';
import { setModalType, openModal, setModalChannel } from '../store/modalsSlice.js';

const ChannelsMenu = ({ channel }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(setModalChannel(channel));
    dispatch(setModalType('removing'));
    dispatch(openModal());
  };

  const handleRename = () => {
    dispatch(setModalChannel(channel));
    dispatch(setModalType('renaming'));
    dispatch(openModal());
  };

  return (
    <div className="dropdown">
      <button type="button">...</button>
      <div className="dropdown-menu">
        <button type="button" onClick={handleRename}>Rename</button>
        <button type="button" onClick={handleRemove}>Remove</button>
      </div>
    </div>
  );
};

export default ChannelsMenu;
