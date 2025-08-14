import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('Home');
  const [tabHidden, setTabHidden] = useState(false);

  return (
    <TabContext.Provider value={{ currentTab, setCurrentTab, tabHidden, setTabHidden }}>
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