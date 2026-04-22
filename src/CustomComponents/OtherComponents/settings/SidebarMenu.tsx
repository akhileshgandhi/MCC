import React, { useEffect } from 'react';

type Props = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const SidebarMenu: React.FC<Props> = ({ activeMenu, setActiveMenu }) => {
  const menus = [
    { key: 'users', label: 'User Management', icon: '👥' },
    { key: 'departments', label: 'Departments', icon: '🏢' },
    { key: 'subdepartments', label: 'Sub-Departments', icon: '🏛️' },
    { key: 'subsubdepartments', label: 'Sub-SubDepartments', icon: '🏘️' },
    { key: 'orgGoalAlignment', label: 'Org Goal Alignment', icon: '🎯' },
    { key: 'hlcCriteria', label: 'HLC Criteria', icon: '📋' },
    { key: 'sharedServices', label: 'Shared Service/Campus Goals', icon: '🤝' },
    // { key: 'tags', label: 'Tags', icon: '🏷️' },
    { key: 'definitions', label: 'Definitions', icon: '📖' },
    { key: 'globalGoals', label: 'Global Goals', icon: '🌐' }
  ];

  // Load saved menu from sessionStorage on mount
  useEffect(() => {
    const savedMenu = sessionStorage.getItem('activeSettingsMenu');
    if (savedMenu && menus.some(m => m.key === savedMenu)) {
      setActiveMenu(savedMenu);
    }
  }, [setActiveMenu]);

  const handleMenuClick = (menuKey: string) => {
    console.log('Clicked:', menuKey);
    setActiveMenu(menuKey);
    // Save to sessionStorage
    sessionStorage.setItem('activeSettingsMenu', menuKey);
  };

  return (
    <div className="list-group">
      {menus.map(menu => (
        <button
          key={menu.key}
          type="button"
          className={`list-group-item list-group-item-action text-start btn-menu ${activeMenu === menu.key ? 'active' : ''
            }`}
          onClick={() => handleMenuClick(menu.key)}
          style={{
            display: 'flex',
            padding: '0.5rem',
            fontSize: '1em',
            gap: '0.2rem'
          }}
        >
          <span className="tab-icon">{menu.icon}</span>
          <span className="tab-icon" style={{ paddingTop: '0.1rem' }}>{menu.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SidebarMenu;