///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import React, { useState, useContext } from 'react';
import { Button, Checkbox } from 'jimu-ui';
import { DetailOutlined } from 'jimu-icons/outlined/application/detail'
import MainContext from '../../Contexts/MainContext';
import { GetFile } from '../../Services/apiService';
import '../File/style.css';

function File({ fileName, folderName }) {
    const [fileIsChecked, setFileIsChecked] = useState(false);
    const [isFileHovered, setIsileHovered] = useState<Boolean>(false);
    const { setSelectedFiles, files, featureId } = useContext(MainContext);
    //const [file, setFile] = useState(null);

    const handleFileCheckboxChange = (isChecked, fileObj) => {
        if (isChecked) {
            setSelectedFiles((prevSelectedFiles) => [
                ...prevSelectedFiles,
                fileObj,
            ]);
        } else {
            setSelectedFiles((prevSelectedFiles) =>
                prevSelectedFiles.filter((file) => file.id !== fileObj.id)
            );
        }
    };

    return (
        <React.Fragment>
            <Button
                className="file-button"
                onMouseEnter={() => setIsileHovered(!isFileHovered)}
                onMouseLeave={() => setIsileHovered(!isFileHovered)}
                onClick={() => {
                    let fileObj = files.find(f => f.fileName === fileName && f.folderName === folderName);
                    GetFile(fileObj);
                }}
            >
                {isFileHovered ? (
                    <Checkbox
                        className="select-file-checkbox"
                        type="checkbox"
                        checked={fileIsChecked}
                        onClick={(e) => {
                            e.stopPropagation();
                            setFileIsChecked(!fileIsChecked);
                            let fileObj = files.find(f => f.fileName === fileName && f.folderName === folderName);
                            handleFileCheckboxChange(e.target["checked"], fileObj);
                        }}
                    ></Checkbox>
                ) : (
                    <DetailOutlined className="file-Icon"></DetailOutlined>
                )}
                {fileName}
            </Button>
        </React.Fragment>
    )
}  

export default File;