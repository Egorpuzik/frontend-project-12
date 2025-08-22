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
      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        id={`dropdown-${channel.id}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="visually-hidden">Управление каналом</span>
      </button>
      <ul className="dropdown-menu" aria-labelledby={`dropdown-${channel.id}`}>
        <li>
          <button type="button" className="dropdown-item" onClick={handleRename}>
            Переименовать
          </button>
        </li>
        <li>
          <button
            type="button"
            className="dropdown-item text-danger"
            onClick={handleRemove}
          >
            Удалить
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ChannelsMenu;
