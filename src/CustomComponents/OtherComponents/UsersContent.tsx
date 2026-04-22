import React from 'react';

const UsersContent = () => {
  return (
    <div className="container-fluid">
      <h1 className="h2 mb-4 text-dark">Users Management</h1>
      
      <div className="card">
        <div className="card-body">
          <h2 className="h5 card-title text-dark mb-3">User Directory</h2>
          <p className="card-text text-muted mb-0">
            Manage users, roles, and permissions across the organization.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersContent;