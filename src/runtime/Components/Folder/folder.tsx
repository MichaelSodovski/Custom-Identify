///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Collapse, Checkbox } from 'jimu-ui';
import { FolderOutlined } from 'jimu-icons/outlined/application/folder'
import MainContext from '../../Contexts/MainContext';
import File from '../File/file'
import '../Folder/style.css'

function Folder({ folderName }) {
    const [openFolder, setOpenFolder] = useState(false);
    const [isFolderHovered, setIsFolderHovered] = useState<Boolean>(false);
    const [folderIsChecked, setFolderIsChecked] = useState(false);
    const [FileNames, setFileNames] = useState([]);
    const { folders, setSelectedFolders, files, featureId } = useContext(MainContext);
    const checkboxRef = useRef(null);

    useEffect(() => {
        if (files.length > 0) {
            let names = [];
            for (const file of files) {
                if (file.folderName === folderName) {
                    names.push(file.fileName);
                }
            }
            setFileNames(names);
        }
    }, [files]);

    const toggleFolder = (event) => {
        setOpenFolder(!openFolder);
    };

    const handleFolderCheckboxChange = (isChecked, folderObj) => {
        if (isChecked) {
            setSelectedFolders((prevSelectedFolders) => [
                ...prevSelectedFolders,
                folderObj,
            ]);
        } else {
            setSelectedFolders((prevSelectedFolders) =>
                prevSelectedFolders.filter((folder) => folder.folderName !== folderObj.folderName)
            );
        }
    };

    return (
        <React.Fragment>
            <div className="accordion-Table-container">
                <Button className="folder-button" onClick={(event) => toggleFolder(event)}
                    onMouseEnter={() => setIsFolderHovered(!isFolderHovered)}
                    onMouseLeave={() => setIsFolderHovered(!isFolderHovered)}>
                    {isFolderHovered ? (
                        <Checkbox className="select-folder-checkbox" type="checkbox" ref={checkboxRef}
                            checked={folderIsChecked}
                            onClick={(e) => {
                                e.stopPropagation()
                                setFolderIsChecked(!folderIsChecked);
                                let folderObj = folders.find(f => f.folderName === folderName);
                                folderObj.fileNames = FileNames;
                                handleFolderCheckboxChange(e.target['checked'], folderObj);
                            }} ></Checkbox>
                    ) : (
                        <FolderOutlined className="folder-Icon"></FolderOutlined>
                    )}
                    {folderName}
                </Button>
                <Collapse isOpen={openFolder}>
                    {files.filter((file) => file.folderName === folderName).map((file, index) => (
                        <File key={index} fileName={file.fileName} folderName={folderName} />
                    ))}
                </Collapse>
            </div>

        </React.Fragment>
    )
}

export default Folder;