import React from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/modalsSlice'; 
import { removeChannel, setCurrentChannelId } from '../../store/channelsSlice'; 

const RemoveChannelModal = () => {
  const dispatch = useDispatch();
  const modalState = useSelector((state) => state.modals.removeChannelModal);
  const channelToRemove = modalState.channel;
  const currentChannelId = useSelector((state) => state.channels.currentChannelId);

  if (!modalState.isOpen) return null;

  const handleRemove = () => {
    dispatch(removeChannel(channelToRemove.id));

    if (channelToRemove.id === currentChannelId) {
      dispatch(setCurrentChannelId(1)); 
    }

    dispatch(closeModal());
  };

  return (
    <div className="modal">
      <h3>Удалить канал</h3>
      <p>Вы уверены, что хотите удалить канал "{channelToRemove.name}"?</p>
      <button onClick={handleRemove}>Удалить</button>
      <button onClick={() => dispatch(closeModal())}>Отмена</button>
    </div>
  );
};

export default RemoveChannelModal;
