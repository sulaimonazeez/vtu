// Profile.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DownNav from "./downNav.jsx";

const Profile = ({user}) => {

  return (
    <div>
    <div className="container mt-5">
      <div className="card shadow-lg rounded">
        <div className="card-body text-center">
          <div className="mb-4">
            <i className="fa fa-user-circle fa-5x text-primary"></i>
          </div>
          <h2 className="card-title font-weight-bold">{user.first_name || "firstname"} {user.last_name || "lastname"}</h2>
          <h5 className="text-muted">@{user.username || "@example"}</h5>
          <p className="mt-3">
            <i className="fa fa-envelope"></i> {user.email || "example@gmail.com"}
          </p>
          <p>
            <i className="fa fa-phone"></i> {user.phone || "08080891605"}
          </p>
        </div>
      </div>
    </div>
      <DownNav />
    </div>
  );
};

export default Profile;

