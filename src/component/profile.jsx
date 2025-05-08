// Profile.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


const Profile = ({user}) => {

  return (
    <div className="container mt-5">
      <div className="card shadow-lg rounded">
        <div className="card-body text-center">
          <div className="mb-4">
            <i className="fa fa-user-circle fa-5x text-primary"></i>
          </div>
          <h2 className="card-title font-weight-bold">{user.firstName} {user.lastName}</h2>
          <h5 className="text-muted">@{user.username}</h5>
          <p className="mt-3">
            <i className="fa fa-envelope"></i> {user.email}
          </p>
          <p>
            <i className="fa fa-phone"></i> {user.phone}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

