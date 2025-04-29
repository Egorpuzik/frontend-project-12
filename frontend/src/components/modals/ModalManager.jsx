import React from 'react';
import { useSelector } from 'react-redux';
import AddChannelModal from './AddChannelModal';
import RemoveChannelModal from './RemoveChannelModal';
import RenameChannelModal from './RenameChannelModal';

const ModalManager = () => {
  const modalState = useSelector((state) => state.modals);

  if (modalState.addChannelModal.isOpen) {
    return <AddChannelModal />;
  }

  if (modalState.removeChannelModal.isOpen) {
    return <RemoveChannelModal />;
  }

  if (modalState.renameChannelModal.isOpen) {
    return <RenameChannelModal />;
  }

  return null; 
};

export default ModalManager;
