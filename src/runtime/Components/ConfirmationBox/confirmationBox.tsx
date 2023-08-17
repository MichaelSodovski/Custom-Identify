///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import React, { useContext, useState } from 'react';
import defaultMessages from "../../translations/default";
import MainContext from '../../Contexts/MainContext';
import { CloseCircleOutlined } from 'jimu-icons/outlined/editor/close-circle';
import { SuccessOutlined } from 'jimu-icons/outlined/suggested/success';
import { addFolder, deleteFolders, deleteFiles, handleGetFoldersAndFiles } from '../../Services/apiService';
import { ActionType } from "../../Enums/actionType";
import { ConfirmationBoxProps } from '../../types/ConfirmationBoxProps';
import '../ConfirmationBox/style.css';
import config from '../../../../config.json';

export default function ConfirmationBox({ actionType, ...props }: ConfirmationBoxProps) {
    const [folderName, setFolderName] = useState<string>("");
    const { setConfirmationBoxIsShown, featureId, selectedFolders,
        selectedFiles, setSelectedFolders, setSelectedFiles, setFolders,
        setFiles, layerID, displayNotification } = useContext(MainContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (actionType === ActionType.ADD) {
            addFolder(event, folderName, featureId, layerID).then((response) => { // add the new folder.

                if (response.msg) {
                    displayNotification(response.msg, config.NotificationDuration);
                }

                handleGetFoldersAndFiles(setFolders, setFiles, featureId,
                    setSelectedFolders,
                    setSelectedFiles); // send a request to get the new list of folder names. 
            });

        } else if (actionType === ActionType.DELETE) {
            if (selectedFolders.length > 0) {
                deleteFolders(selectedFolders, featureId).then((response) => {

                    if (response.msg) {
                        displayNotification(response.msg, config.NotificationDuration);
                    }

                    handleGetFoldersAndFiles(setFolders, setFiles, featureId,
                        setSelectedFolders,
                        setSelectedFiles); // send a request to get the new list of folder names. 
                });
                // clear the selected folders array to prevent duplications. 
                setSelectedFolders([]);
            }
            if (selectedFiles) {
                deleteFiles(selectedFiles, featureId).then((response) => {

                    if (response.msg) {
                        displayNotification(response.msg, config.NotificationDuration);
                    }

                    handleGetFoldersAndFiles(setFolders, setFiles, featureId,
                        setSelectedFolders,
                        setSelectedFiles); // send a request to get the new list of folder names. 
                });
                // clear the selected files array to prevent duplications. 
                setSelectedFiles([]);
            }
        }
        setConfirmationBoxIsShown(false);
    };

    let content = (
        <React.Fragment>
            <form className="confirmation-box-form-container" onSubmit={handleSubmit}>
                {actionType === ActionType.ADD && (
                    <>
                        <div className="lbl-container">
                            <label id="confirmation-box-lbl-header"> {props.intl.formatMessage({ id: 'CreateNewFolder', defaultMessage: defaultMessages.CreateNewFolder })} </label>
                        </div>
                        <div className="form-input-container">
                            <input
                                className="input-folder-name"
                                value={folderName}
                                type="text"
                                name="folderName"
                                placeholder={config.PlaceholderFolderName}
                                onChange={(evt) => setFolderName(evt.target.value)}>
                            </input>
                        </div>
                    </>)}
                {(actionType === ActionType.DELETE && (selectedFolders.length !== 0 || selectedFiles.length !== 0)) && (
                    <div className="lbl-container">
                        <label id="confirmation-box-lbl-header"> {props.intl.formatMessage({ id: 'Confirm', defaultMessage: defaultMessages.Confirm })} </label>
                    </div>
                )} {(actionType === ActionType.DELETE && (selectedFolders.length === 0 && selectedFiles.length === 0)) && (
                    <div className="lbl-container">
                        <label id="confirmation-box-lbl-header"> {props.intl.formatMessage({ id: 'ChooseFileOrFolder', defaultMessage: defaultMessages.ChooseFileOrFolder })} </label>
                    </div>
                )}
                <div className="confirmation-box-btns-container">
                    {(actionType === ActionType.DELETE && (selectedFolders.length !== 0 || selectedFiles.length !== 0) ||
                        actionType === ActionType.ADD) && (
                            <div className="form-submit-btn-container">
                                <button className="form-submit-btn" onClick={() => {
                                    setConfirmationBoxIsShown(false);
                                }}>
                                    <div className="lbl-icon-container">
                                        <label id="confirmation-box-lbl-btns"> {props.intl.formatMessage({ id: 'Cancel', defaultMessage: defaultMessages.Cancel })} </label>
                                        <CloseCircleOutlined size={16}></CloseCircleOutlined>
                                    </div>
                                </button>
                            </div>
                        )}
                    {(actionType === ActionType.DELETE || actionType === ActionType.ADD) && (
                        <div className="form-submit-btn-container">
                            <button className="form-submit-btn" >

                                <div className="lbl-icon-container">
                                    <label id="confirmation-box-lbl-btns"> {props.intl.formatMessage({ id: 'Ok', defaultMessage: defaultMessages.Ok })} </label>
                                    <SuccessOutlined size={16}></SuccessOutlined>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </React.Fragment>
    )

    return (
        <>
            {content}
        </>
    )
}