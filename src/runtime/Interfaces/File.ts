export interface File {
    attachment: null | string;
    featureID: number;
    fileID: string;
    fileName: string;
    folderID: number;
    folderName: string;
    id: number;
    layerID: null | number;
    selectedFolderIds: null | string;
    fileContent: FileContent
}

export interface FileContent {
    content?: Uint8Array | null;
    mimeType?: string | null;
  }