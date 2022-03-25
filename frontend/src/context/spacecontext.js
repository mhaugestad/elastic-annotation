import { createContext, useContext } from 'react';

export const SpaceContext = createContext({});

export const useSpace = () => {
  return useContext(SpaceContext);
}