import React from 'react';
import PropTypes from 'prop-types';
import { Input, Modal } from '@geist-ui/core';

const TransferModal = ({ isModalVisible, setIsModalVisible, onSubmit }) => {
  const [to, setTo] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  return (
    <Modal
      visible={isModalVisible}
      onClose={() => {
        setTo('');
        setAmount('');
        setIsModalVisible(false);
      }}
    >
      <Modal.Title>Transfer Tokens</Modal.Title>
      <Modal.Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="To Address"
          onChange={(e) => setTo(e.target.value)}
          value={to}
          width="100%"
        />
        <Input
          placeholder="Amount"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          width="100%"
        />
      </Modal.Content>
      <Modal.Action
        passive
        onClick={() => {
          setIsModalVisible(false);
        }}
      >
        Cancel
      </Modal.Action>
      <Modal.Action
        onClick={() => {
          setTo('');
          setAmount('');
          onSubmit(to, amount);
        }}
      >
        Send
      </Modal.Action>
    </Modal>
  );
};

TransferModal.propTypes = {
  isModalVisible: PropTypes.bool.isRequired,
  setIsModalVisible: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TransferModal;
