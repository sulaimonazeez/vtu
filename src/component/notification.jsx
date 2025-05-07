import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DownNav from "./downNav";
export default function Notifications() {
  const notifications = [
    { id: 1, icon: 'fa fa-bell', message: 'You have a new message from Admin.', time: '2 mins ago' },
    { id: 2, icon: 'fa fa-check-circle', message: 'Your profile was updated successfully.', time: '10 mins ago' },
    { id: 3, icon: 'fa fa-exclamation-circle', message: 'Password change required.', time: '1 hour ago' },
    { id: 4, icon: 'fa fa-info-circle', message: 'System maintenance scheduled tomorrow.', time: '1 day ago' }
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Notifications</h2>
      <div className="list-group">
        {notifications.map((notification) => (
          <div key={notification.id} className="list-group-item d-flex align-items-center p-3 mb-3 shadow-sm rounded">
            <i className={`${notification.icon} text-primary me-3 fa-2x`}></i>
            <div className="flex-grow-1">
              <p className="mb-1 font-weight-bold">{notification.message}</p>
              <small className="text-muted">{notification.time}</small>
            </div>
          </div>
        ))}
      </div>
      <DownNav />
    </div>
  );
}
