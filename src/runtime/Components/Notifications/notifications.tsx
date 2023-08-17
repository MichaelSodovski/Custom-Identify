import React from 'react';
import './style.css';

const AppNotification = ({ message, show }) => {
  return (
    <div className={`notification${show ? ' slide-in' : ' slide-out'}`}>
      {message}
    </div>
  );
};

export default AppNotification;

