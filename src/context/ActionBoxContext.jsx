import React, { createContext, useContext, useRef } from 'react';

// Create the context
const ActionBoxContext = createContext(null);

// Provider component
export const ActionBoxProvider = ({ children }) => {
  const actionBoxRef = useRef(null);

  return (
    <ActionBoxContext.Provider value={actionBoxRef}>
      {children}
    </ActionBoxContext.Provider>
  );
};

// Hook to use the action box context
export const useActionBox = () => {
  return useContext(ActionBoxContext);
};
