import React from 'react';

const Profile = ({ user }) => {
  return (
    <div style={styles.container}>
      <div style={styles.profileSection}>
        {/* Profile Image Icon */}
        <div style={styles.iconContainer}>
          <i className="fas fa-user-circle" style={styles.icon}></i>
        </div>

        <div style={styles.textContainer}>
          {/* User Info */}
          <h2 style={styles.name}>{user.firstName} {user.lastName}</h2>
          <p style={styles.username}>{user.username}</p>

          <div style={styles.contactInfo}>
            <p style={styles.contactItem}><strong>Email:</strong> {user.email}</p>
            <p style={styles.contactItem}><strong>Phone:</strong> {user.phone}</p>
          </div>

          {/* Button to change profile picture */}
          <button style={styles.button}>Change Profile Picture</button>
        </div>
      </div>
    </div>
  );
};

// Styles (in JS object format)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '80%',
    maxWidth: '800px',
    padding: '20px',
  },
  iconContainer: {
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    fontSize: '120px',
    color: '#6c757d',
  },
  textContainer: {
    flex: 2,
    marginLeft: '20px',
  },
  name: {
    fontSize: '24px',
    color: '#343a40',
    marginBottom: '10px',
  },
  username: {
    fontSize: '18px',
    color: '#6c757d',
    marginBottom: '15px',
  },
  contactInfo: {
    marginBottom: '20px',
  },
  contactItem: {
    fontSize: '16px',
    color: '#495057',
    marginBottom: '5px',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default Profile;
