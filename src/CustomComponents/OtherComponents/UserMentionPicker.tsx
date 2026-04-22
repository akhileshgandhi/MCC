import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { UserMentionPickerProps } from '../../types/UserMentionPickerProps';
import { User } from '../../types/User';
import Loader from '../../Common/Loader';

const UserMentionPicker: React.FC<UserMentionPickerProps> = ({ 
  sp, 
  onUsersSelected, 
  selectedUsers 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sp) {
      loadUsers();
    }
  }, [sp]);

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user => 
        (user.title.toLowerCase().includes(query) || 
         user.email.toLowerCase().includes(query)) &&
        !selectedUsers.some(su => su.id === user.id)
      );
      setFilteredUsers(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allUsers, selectedUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const siteUsers = await sp.web.siteUsers();
      console.log(siteUsers,'siteUsers');
      
      // Filter only actual users (not groups)
      const users = siteUsers
        .filter((u: any) => u.PrincipalType === 1 && u.Title && u.Email)
        .map((u: any) => ({
          id: u.Id,
          title: u.Title,
          email: u.Email
        }));
      console.log(users,'users>>>');
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const updatedUsers = [...selectedUsers, user];
    onUsersSelected(updatedUsers);
    setSearchQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemoveUser = (userId: number) => {
    const updatedUsers = selectedUsers.filter(u => u.id !== userId);
    onUsersSelected(updatedUsers);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Selected Users as Chips */}
      {selectedUsers.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {selectedUsers.map(user => (
            <div
              key={user.id}
              className="badge bg-primary d-flex align-items-center gap-1"
              style={{ 
                fontSize: '0.8rem', 
                padding: '6px 10px',
                borderRadius: '16px'
              }}
            >
              <span>@{user.title}</span>
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ 
                  fontSize: '0.6rem',
                  padding: '2px'
                }}
                onClick={() => handleRemoveUser(user.id)}
                aria-label={`Remove ${user.title}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="input-group input-group-sm">
        <span className="input-group-text">
          <Search size={14} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Type @ to mention users..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim() && filteredUsers.length > 0) {
              setShowDropdown(true);
            }
          }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          style={{ fontSize: '0.85rem' }}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {loading ? (
            <div className="text-center py-3">
              <Loader size="small" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-muted text-center py-2" style={{ fontSize: '0.85rem' }}>
              No users found
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectUser(user)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '28px', 
                        height: '28px',
                        fontSize: '12px'
                      }}
                    >
                      {user.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-semibold">{user.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMentionPicker;
