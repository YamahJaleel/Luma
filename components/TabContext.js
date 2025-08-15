import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('Home');
  const [tabHidden, setTabHidden] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true); // Start with true since welcome notification is unread

  return (
    <TabContext.Provider value={{ 
      currentTab, 
      setCurrentTab, 
      tabHidden, 
      setTabHidden,
      hasUnreadNotifications,
      setHasUnreadNotifications
    }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
}; 