import * as React from 'react';
import { X } from 'lucide-react';
import '../CustomCss/Dashboard.scss'; // reuse your existing styling setup
import { UserProfileModalProps } from '../../types/UserProfileModalProps.js';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user,usersList }) => {
    console.log(usersList,'usersList');
    
  if (!isOpen) return null;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name[0].toUpperCase();
  };

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" style={{zIndex:'99999999'}}>
      <div
        className="modal-content shadow"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '360px',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          className="text-center"
          style={{
            backgroundColor: 'rgb(11 79 134 / 30%)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '1.5rem 0 3rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn p-0 position-absolute"
            style={{ top: '12px', right: '12px', border: 'none', background: 'transparent' }}
          >
            <X size={20} color="#555" />
          </button>

          {/* Avatar Circle */}
          <div
            className="mx-auto d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgb(11, 79, 134)',
              color: 'white',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              fontSize: '24px',
              fontWeight: 600,
              position: 'absolute',
              left: '50%',
              bottom: '-35px',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 0 4px white',
            }}
          >
            {getInitials(user.name)}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 mt-5 text-center">
          <h5 className="fw-semibold text-dark mb-4">{user.name}</h5>

          <div className="mb-3 text-start">
            <label className="form-label fw-semibold small text-muted">Email</label>
            <input
              type="text"
              className="form-control"
              value={user.email}
              readOnly
              style={{ backgroundColor: '#fff' }}
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-semibold small text-muted">Role</label>
            <input
              type="text"
              className="form-control"
              value={usersList[0].Role}
              readOnly
              style={{ backgroundColor: '#fff' }}
            />
          </div>
            <div className="mb-3 text-start">
            <label className="form-label fw-semibold small text-muted">Department</label>
            <input
              type="text"
              className="form-control"
              value={usersList[0].Departments?.Title}
              readOnly
              style={{ backgroundColor: '#fff' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1050;
        }
      `}</style>
    </div>
  );
};

export default UserProfileModal;
