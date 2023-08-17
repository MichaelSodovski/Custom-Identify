import React from 'react';

interface MainContext {
  setFeatureId: (featureId: number) => void;
  featureId: number;
  confirmationBoxIsShown: boolean;
  setConfirmationBoxIsShown: (addFolderPopUp: boolean) => void;
  folders: any[];
  setFolders: (folders) => void;
  files: any[];
  setFiles: (files) => void;
  selectedFiles: any[];
  setSelectedFiles: (selectedFiles) => void;
  selectedFolders: any[];
  setSelectedFolders: (selectedFolders) => void;
  featureName: string;
  setFeatureName: (featureName) => void;
  layerID: any[];
  displayNotification: (message: string, duration: number) => void;
}

const MainContext = React.createContext<MainContext>({
  featureId: null,
  setFeatureId: () => null,
  confirmationBoxIsShown: false,
  setConfirmationBoxIsShown: () => false,
  folders: null,
  setFolders: () => null,
  files: null,
  setFiles: () => null,
  selectedFiles: null,
  setSelectedFiles: () => null,
  selectedFolders: null,
  setSelectedFolders: () => null,
  featureName: null,
  setFeatureName: () => null,
  layerID: null,
  displayNotification: () => {},
});

export default MainContext;