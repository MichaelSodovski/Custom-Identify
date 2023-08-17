///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import config from '../../../config.json';
import { handleFile } from '../Services/fileHandlerService'
import { File } from '../Interfaces/File';
import { Folder } from '../Interfaces/Folder';
import { SupportedMimeTypes } from '../Enums/supportedMimeTypes';
import { ERROR_MESSAGES } from '../Interfaces/errorMessages';
import { RequestMethod } from "../Enums/requestMethods";



export async function GetUserPermissions(LayerID) {
    if (LayerID) {
        const url = new URL(config.GetUserPermissions);
        url.searchParams.append("LayerID", String(LayerID));

        let userNotFound = false;

        try {
            const response = await fetch(url, {
                method: RequestMethod.GET,
                credentials: config.Credentials.INCLUDE,
            })

            if (!response.ok) {
                const errorText = await response.text();
                if ([errorText].includes(ERROR_MESSAGES.USER_NOT_FOUND)) {
                    userNotFound = true;
                } else {
                    throw new Error(ERROR_MESSAGES.NETWORK_RESPONSE_NOT_OK);
                }
            }

            if (userNotFound) {
                return {
                    res: response,
                    msg: config.UserIsNotFouldNotification
                }
            } else {
                const parsedData = await response.json();
                return parsedData;
            }

        } catch (error) {
            console.error(ERROR_MESSAGES.ERROR_CREATING_FOLDER, error);
            return [];
        }
    }
}


export async function handleGetFoldersAndFiles(setFolders, setFiles, featureId, setSelectedFolders, setSelectedFiles) {
    setSelectedFolders([]); setSelectedFiles([]); setFolders([]); setFiles([]);
    if (featureId) {
        await getFolders(featureId).then(async (folders) => {
            setFolders(folders);
            await getFileNamesByFolderNames(folders.map(folder => folder.folderName), featureId).then((files) => {
                setFiles(files);
            });
        });
    }
}


export async function getFileNamesByFolderNames(folderNames: string[], featureId: number): Promise<File[]> {
    if (folderNames.length > 0) {
        try {
            const response = await fetch(`${config.GetFileNamesByFolderNames}`, {
                method: RequestMethod.POST,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: config.Credentials.INCLUDE,
                body: JSON.stringify({ folderNames: folderNames, featureId: featureId })
            });

            if (!response.ok) {
                throw new Error(ERROR_MESSAGES.NETWORK_RESPONSE_NOT_OK);
            }
            const parsedData = await response.json();
            const files = parsedData.map((f) => f);
            return files;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}


export async function addFolder(event, folderName: string, featureId: number, LayerID: any): Promise<any> {
    event.preventDefault(); // Prevent default form submission
    // Fetch existing folders and check for duplicates
    if (folderName === "") {
        return {
            res: {},
            msg: config.PleaseInputFolderName
        }
    }

    const existingFolders = await getFolders(featureId);
    const isDuplicate = existingFolders.some(folder => folder.folderName === folderName);
    if (isDuplicate) {
        console.error(ERROR_MESSAGES.FOLDER_ALREADY_EXISTS);
        return {
            res: {},
            msg: config.FolderAlreadyExistsNotification
        }
    }

    try {
        const response = await fetch(config.AddFolderDetailsUrl, {
            method: RequestMethod.POST,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ folderName: folderName, featureId: featureId, LayerID: LayerID }),
            credentials: config.Credentials.INCLUDE,
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(ERROR_MESSAGES.FOLDER_CREATED_SUCCESSFULLY, jsonResponse);
            return {
                res: response,
                msg: config.SucessfullyAddedFolder
            }
        } else {
            console.error(ERROR_MESSAGES.ERROR_CREATING_FOLDER, response.statusText);
            return {
                res: response,
                msg: config.ErrorCreatingFolder
            }
        }
    } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_CREATING_FOLDER, error);
        return {
            res: error,
            msg: config.ErrorInpuNotificationt
        }
    }
};


export async function getFolders(featureId: number): Promise<Folder[]> {
    try {
        const response = await fetch(`${config.GetFolderNamesUrl}${featureId}`, {
            method: RequestMethod.GET,
            credentials: config.Credentials.INCLUDE,
        });

        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.NETWORK_RESPONSE_NOT_OK);
        }

        const parsedData = await response.json();
        return parsedData;
    } catch (error) {
        console.error(error);
        return [];
    }
};


function removeDuplicates(folders) {
    const uniqueFolders = [];
    const folderNames = new Set();
    for (const folder of folders) {
        if (!folderNames.has(folder.folderName)) {
            uniqueFolders.push(folder);
            folderNames.add(folder.folderName);
        }
    }
    return uniqueFolders;
}


export async function deleteFolders(folders, featureId: number): Promise<any> {
    if (folders.length !== 0) {
        // Filter out empty objects or objects missing folderName or fileName properties
        const filteredFolders = folders.filter(folder => folder.folderName && Array.isArray(folder.fileNames));
        // remove any duplicated that end up in the folders array. 
        const uniqueFolders = removeDuplicates(filteredFolders);

        try {
            const response = await fetch(config.DeleteFoldersUrl, {
                method: RequestMethod.DELETE,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ folders: uniqueFolders, featureId: featureId }),
                credentials: config.Credentials.INCLUDE,
            })

            if (response.ok) {
                console.log(ERROR_MESSAGES.FOLDER_CREATED_SUCCESSFULLY);
                return {
                    res: response,
                    msg: config.SucessfullDeleteFolder
                }
            } else {
                console.error(ERROR_MESSAGES.ERROR_DELETING_FOLDER, response.statusText);
                const responseBody = await response.text();
                console.error("Response body:", responseBody);
                return {
                    res: {},
                    msg: config.ErrorDeleteFolders
                }
            }
        } catch (error) {
            console.error(ERROR_MESSAGES.ERROR_DELETING_FOLDER, error);
            return {
                res: {},
                msg: config.ErrorDeleteFolders
            }
        }
    }
}


export async function deleteFiles(files, featureId: number): Promise<any> {
    // Filter out empty objects or objects missing folderName or fileName properties
    const filteredFiles = files.filter(folder => folder.folderName);
    // remove any duplicated that end up in the folders array. 
    const uniqueFiles = removeDuplicates(filteredFiles);
    // map the fields to match the model from the server side. 
    const mappedUniqueFiles = uniqueFiles.map(file => {
        return {
            ...file,
            FeatureID: file.featureID,
            FileID: file.fileID
        };
    });

    try {
        const response = await fetch(config.DeleteFilesUrl, {
            method: RequestMethod.DELETE,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ files: mappedUniqueFiles, featureId: featureId }),
            credentials: config.Credentials.INCLUDE,
        })

        if (response.ok) {
            console.log(ERROR_MESSAGES.FILES_DELETED_SUCCESSFULLY);
            return {
                res: response,
                msg: config.SeccessDeletingFiles
            }
        } else {
            console.error(ERROR_MESSAGES.ERROR_DELETING_FILES, response.statusText);
            const responseBody = await response.text();
            console.error("Response body:", responseBody);
            return {
                res: response,
                msg: config.ErrorDeletingFiles
            }
        }
    } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_DELETING_FILES, error);
        return {
            res: {},
            msg: config.ErrorDeletingFiles
        }
    }
}


async function mimeValidation(formData: FormData): Promise<string | null> {
    const folderNames = JSON.parse((formData.get('FolderNames') as unknown) as string);
    if (folderNames.length === 0) {
        return config.SelectFolderNotification;
    }

    const featureId = (formData.get('FeatureID') as unknown) as number;

    const fileNameToUpload = ((formData.get('FileName') as unknown) as string)
        .substring(((formData.get('FileName') as unknown) as string).indexOf("c:\\fakepath\\") + 13);

    const supportedMimeTypes = Object.keys(SupportedMimeTypes)
        .filter(key => isNaN(Number(key))) // Exclude numeric keys (TypeScript enums include reverse mappings)
        .map(key => SupportedMimeTypes[key as keyof typeof SupportedMimeTypes] as string); // Map keys to values

    for (const folderName of folderNames) {
        const existingFiles = await getFileNamesByFolderNames([folderName], featureId); // existing files per folder
        const isDuplicate = existingFiles.some(file => file.fileName == fileNameToUpload);
        if (isDuplicate) {
            return config.FileAlreadyExistsNotification;
        }

        // in some cases the browser doesnt know how to handle some mime types so they end up as an empty string. 
        // in those cases handle the mime type by mapping mime types according to the file extention.
        let fileMimeType = formData.get('MimeType') as string; // get the mime type. 
        if (fileMimeType === "") {
            const fileExtension = formData.get('fileExtention') as string;
            switch (fileExtension) {
                case ".dwg":
                    fileMimeType = "application/acad";
                    break;
            }
        }

        const isSupportedMimeType = supportedMimeTypes.includes(fileMimeType);
        if (!isSupportedMimeType) {
            return config.UnsupportedFileType;
        }
    }
    return null;
}


export async function addFile(event, formData: FormData): Promise<any> {
    event.preventDefault(); // Prevent default form submission
    const validationResult = await mimeValidation(formData);

    if (validationResult === null) {
        try {
            const response = await fetch(config.AddFileUrl, {
                method: RequestMethod.POST,
                body: formData,
                credentials: config.Credentials.INCLUDE,
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log(ERROR_MESSAGES.FILE_UPLOADED_SUCCESSFULLY, jsonResponse);
                return {
                    res: response,
                    msg: config.FileAddedSuccessfully
                }
            } else {
                console.error(ERROR_MESSAGES.ERROR_UPLOADING_FILE, response.statusText);
                return {
                    res: response,
                    msg: config.NoFeatureFound
                }
            }
        } catch (error) {
            console.error(ERROR_MESSAGES.ERROR_UPLOADING_FILE, error);
        }
    } else {
        return {
            res: {},
            msg: validationResult
        }
    }
};


export async function GetFile(selectedFile: File): Promise<File> {
    const url = new URL(config.GetFile);
    url.searchParams.append("featureID", String(selectedFile.featureID));
    url.searchParams.append("fileID", selectedFile.fileID);
    url.searchParams.append("fileName", selectedFile.fileName);
    url.searchParams.append("folderID", String(selectedFile.folderID));
    url.searchParams.append("folderName", String(selectedFile.folderName));
    url.searchParams.append("id", String(selectedFile.id));
    url.searchParams.append("layerID", String(0));

    try {
        const response = await fetch(url, {
            method: RequestMethod.GET,
            credentials: config.Credentials.INCLUDE
        }).then(async response => {
            if (!response.ok) {
                throw new Error(ERROR_MESSAGES.NETWORK_RESPONSE_NOT_OK);
            }
            let fileName;

            const blob = await response.blob();
            const contentDisposition = response.headers.get("Content-Disposition");

            if (contentDisposition) {
                const fileNameRegex = /filename\*?=([^;]+)/;
                const matches = contentDisposition.match(fileNameRegex);

                if (matches && matches[1]) {
                    fileName = decodeURIComponent(matches[1].replace(/['"]/g, ""));
                }
            } else {
                fileName = "default_filename";
            }

            let fileDetails = {
                "blob": blob,
                "fileName": fileName
            }
            return fileDetails;
        }).then(fileDetails => {
            // pass the blob and the mime type to a service to handle the file. 
            handleFile(fileDetails);
        });
    } catch (error) {
        console.error(error);
        return selectedFile;
    }
}







