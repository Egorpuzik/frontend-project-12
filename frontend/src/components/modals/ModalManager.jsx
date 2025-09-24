import React from 'react';
import { useSelector } from 'react-redux';
import AddChannelModal from './AddChannelModal';
import RemoveChannelModal from './RemoveChannelModal';
import RenameChannelModal from './RenameChannelModal';

const ModalManager = () => {
  const { isOpen, type, channelId } = useSelector((state) => state.modals);

  if (!isOpen) return null;

  switch (type) {
    case 'adding':
      return <AddChannelModal />;
    case 'removing':
      return <RemoveChannelModal channelId={channelId} />;
    case 'renaming':
      return <RenameChannelModal channelId={channelId} />;
    default:
      return null;
  }
};

export default ModalManager;
