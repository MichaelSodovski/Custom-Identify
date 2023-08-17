///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import React, { useContext } from 'react';
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { AllWidgetProps } from "jimu-core";
import { Button, Switch, TextInput } from 'jimu-ui';
import { useEffect, useRef, useState } from "react";
import defaultMessages from "./translations/default";
import Navbar from './Components/NavBar/navbar';
import Folder from './Components/Folder/folder';
import Notifications from './Components/Notifications/notifications';
import ConfirmationBox from './Components/ConfirmationBox/confirmationBox';
import MainContext from './Contexts/MainContext';
import { AddFolderOutlined } from 'jimu-icons/outlined/editor/add-folder';
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash';
import { ArrowUpOutlined } from 'jimu-icons/outlined/directional/arrow-up';
import { addFile, handleGetFoldersAndFiles, GetUserPermissions } from './Services/apiService';
import TableCarousel from './Components/TableCarousel/tableCarousel';
import { User } from './Interfaces/User';
import { Loading } from 'jimu-ui';
import FeatureLayer from 'esri/layers/FeatureLayer'
import config from '../../config.json';
import '../runtime/style.css';


export default function Widget(props: AllWidgetProps<any>) {
  const [jimuMapView, setjimuMapView] = useState<JimuMapView>(null);
  // const [isCheckedSPS, setIsCheckedSPS] = useState(false);
  // const [isCheckedMaagan, setIsCheckedMaagan] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState<Number>(1);
  const [queriedFeatures, setQueriedFeatures] = useState([]);
  const [featureId, setFeatureId] = useState<number>(null);
  const [confirmationBoxIsShown, setConfirmationBoxIsShown] = useState<boolean>(false);
  const [actionType, setActionType] = useState(null);
  const fileInputRef = useRef(null);
  const currentFileRef = useRef(null);
  const [fileName, setfileName] = useState<string>('');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [featureName, setFeatureName] = useState<string>('');
  const [inputKey, setInputKey] = useState(0);
  const [user, setUser] = useState<User>();
  const [layerID, setLayerID] = useState(null);
  const [loading, setLoading] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  let navmenu = <Navbar onMenuSelect={(evt) => onMenuSelect(evt)} allWidgetProps={props}></Navbar>

  const displayNotification = (message, duration) => {
    setNotificationMessage(message);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, duration);
  };


  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (queriedFeatures.length > 0) {
      setFeatureId(queriedFeatures[0].attributes.objectid);
    }
  }, [queriedFeatures]);


  useEffect(() => {
    handleGetFoldersAndFiles(setFolders, setFiles, featureId,
      setSelectedFolders, setSelectedFiles); // send a request to get the new list of folder names. 
    //get user permissions. 
    if (queriedFeatures.length > 0) {
      let featuresArr = queriedFeatures.find(f => f.attributes.objectid === featureId);
      setLayerID(featuresArr.layer.layerId);
    }
  }, [featureId])


  useEffect(() => {
    if (layerID) {
      setLoading(true);
      GetUserPermissions(layerID).then((response) => {
        setUser(response);
        if (response.msg) {
          // handle notification.
          displayNotification(response.msg, config.NotificationDuration);
        }
      })
    }
  }, [layerID])

  const handleFocusClick = () => {
    const feature = queriedFeatures.find((f) => {
      return f.attributes.objectid === featureId;
    });
    if (jimuMapView && jimuMapView.view && feature) {
      if (feature) {
        jimuMapView.view.goTo(feature.geometry);
      }
    }
  };

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setjimuMapView(jmv);
    }
    jmv.view.on("click", async (event) => {
      const hitTestResults = await jmv.view.hitTest(event);
      if (hitTestResults.results.length > 0) {
        const topResult = hitTestResults.results[0];
        const layer = topResult.layer;
        // Check if the layer is a FeatureLayer
        if (layer instanceof FeatureLayer) {
          // Create a query.
          const query = layer.createQuery();
          query.geometry = event.mapPoint;
          query.distance = config.QueryDistance;
          query.units = config.QueryUnits; // Set units
          query.spatialRelationship = config.QuerySpatialRelationship; // Set spatial relationship.
          query.outFields = config.QueryOutFields; // set fields.
          query.returnGeometry = config.QueryReturnGeometry;
          // Execute query.
          const queryResults = await layer.queryFeatures(query);
          setQueriedFeatures(queryResults.features);
        }
      }
    });
  }

  const onMenuSelect = (evt) => {
    setActiveTabIndex(evt);
  }

  const selectedFolderNames = () => {
    let selectedFolderNames = [];
    for (const selectedFolder of selectedFolders) {
      selectedFolderNames.push(selectedFolder.folderName);
    }
    return selectedFolderNames;
  }

  const onFileChange = async (event) => {
    if (fileInputRef.current?.files.length > 0) {
      currentFileRef.current = fileInputRef.current?.files[0];
    }
    var fileName = event.target.value;

    // Check file size
    const fileSizeLimit = config.FileSize * 1024 * 1024; // 50 MB
    if (currentFileRef.current.size > fileSizeLimit) {
      // Display an error message
      displayNotification(config.FileSizeNotification, config.NotificationDuration);
      return;
    }

    setfileName(fileName);
    const formData = new FormData();
    formData.append('f', 'json');
    formData.append('Attachment', currentFileRef.current as File);
    formData.append('MimeType', (currentFileRef.current as File).type); // Get MIME type.
    formData.append('fileExtention', '.' + (currentFileRef.current as File).name.split('.').pop()?.toLowerCase()); // get file extension.
    formData.append("FileName", fileName.toString());
    formData.append("FolderNames", JSON.stringify(selectedFolderNames()));
    formData.append("selectedFolderIds", JSON.stringify(selectedFolders)); // convert to json string and then back again at the server side.
    formData.append("FeatureID", featureId.toString());
    formData.append("LayerID", layerID.toString());
    addFile(event, formData).then((response) => { // send a request to get the new list of folder names. (to refresh the list)
      if (response.msg) {
        // handle notification.
        displayNotification(response.msg, config.NotificationDuration);
      }
      handleGetFoldersAndFiles(setFolders, setFiles,
        featureId, setSelectedFolders,
        setSelectedFiles);
    }).then(() => {
      setInputKey(prevKey => prevKey + 1); // fix for the bug of the stuck input element that uploads the file. (change its state to force rerender in case it didnt.)
    });
  }


  let content = (
    <React.Fragment>
      {activeTabIndex === 1 && (
        <div className="jimu-widget">
          {navmenu}
          <hr></hr>
          {queriedFeatures.length === 0 && (
            <div className={'choose-feature-container'}>
              <p>{props.intl.formatMessage({ id: 'ChooseItem', defaultMessage: defaultMessages.ChooseItem })}</p>
            </div>
          )}
          {queriedFeatures.length !== 0 && (
            <div className={'flex-container-switch-main'}>
              <span className={'span-of-switch esri-widget__heading'}> {featureName} </span>
              <div className={'flex-container-switch'}>
                <div className={'maagan-switch-container'}>
                  {/* <label className={'maagan-switch-label'}>{props.intl.formatMessage({ id: 'Single Planning Structure', defaultMessage: defaultMessages.SPS })}</label> */}
                  {/* <Switch checked={isCheckedSPS} onChange={(evt) => setIsCheckedSPS(evt.target.checked)} ></Switch> */}
                </div>
                <div className={'sps-switch-container'}>
                  {/* <label className={'sps-switch-label'}>{props.intl.formatMessage({ id: 'Maagan', defaultMessage: defaultMessages.Maagan })}</label> */}
                  {/* <Switch checked={isCheckedMaagan} onChange={(evt) => setIsCheckedMaagan(evt.target.checked)} ></Switch> */}
                </div>
              </div>
            </div>
          )}
          <TableCarousel
            queriedFeatures={queriedFeatures}
            handleFocusClick={handleFocusClick}
            featureId={featureId}
            {...props}
          ></TableCarousel>
        </div>
      )}

      {activeTabIndex === 0 && (
        <div className="jimu-widget">
          {navmenu}
          <div className="attachedFilesNavBar">
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <Loading />
              </div>
            ) : (
              // user && user.canEdit 
              true
              && (
                <>
                  <form encType="multipart/form-data" method="post" id="uploadForm">
                    <div className="field">
                      <TextInput
                        ref={fileInputRef}
                        type="file"
                        name="file"
                        id="inFile"
                        onChange={onFileChange}
                        style={{ display: 'none' }} // Hide the input
                        key={inputKey}
                      ></TextInput>
                    </div>
                  </form>
                  <Button className={"nav-btn"}>
                    <label htmlFor="inFile" style={{ cursor: 'pointer' }}>
                      <ArrowUpOutlined size={16}></ArrowUpOutlined>
                    </label>
                  </Button>
                  <Button key={inputKey} onClick={() => {
                    setActionType("add")
                    setConfirmationBoxIsShown(true)
                  }}
                    className={"nav-btn"}
                  >
                    <AddFolderOutlined size={16} style={{ marginBottom: 0 }}></AddFolderOutlined>
                  </Button>
                  <Button onClick={() => {
                    setActionType("delete")
                    setConfirmationBoxIsShown(true)
                  }}
                    className={"nav-btn"}
                  >
                    <TrashOutlined size={16}></TrashOutlined>
                  </Button>
                </>
              )
            )}
          </div>
          <div>
            <div className={'folder-container-wrapper'}>
              {folders.map(folder => folder.folderName).map((folderName, index) => (
                <Folder key={index}
                  folderName={folderName} />
              ))}
            </div>
            {folders.length === 0 && loading === false &&
              <div className={'no-files-to-show-container'}>
                <p> {props.intl.formatMessage({ id: 'NoFilesForCurrentFeatureToShow', defaultMessage: defaultMessages.NoFilesForCurrentFeatureToShow })} </p>
              </div>
            }
            {queriedFeatures.length === 0 && (
              <div className={'choose-feature-container'}>
                <p>{props.intl.formatMessage({ id: 'ChooseItem', defaultMessage: defaultMessages.ChooseItem })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmationBoxIsShown === true && (
        <>
          <div className={'confirmation-box-container'}></div>
          <ConfirmationBox actionType={actionType} {...props} ></ConfirmationBox>
        </>
      )}

      {showNotification &&
        <Notifications message={notificationMessage} show={showNotification} />
      }
    </React.Fragment>
  )
  return (<MainContext.Provider value={{
    featureId,
    setFeatureId,
    confirmationBoxIsShown,
    setConfirmationBoxIsShown,
    setFolders,
    folders,
    setFiles,
    files,
    setSelectedFiles,
    setSelectedFolders,
    selectedFiles,
    selectedFolders,
    featureName,
    setFeatureName,
    layerID,
    displayNotification
  }}>
    <div className={'widget_padding'}>{
      content

    }</div>
    <JimuMapViewComponent
      useMapWidgetId={props.useMapWidgetIds?.[0]}
      onActiveViewChange={activeViewChangeHandler}
    />
  </MainContext.Provider>)
}