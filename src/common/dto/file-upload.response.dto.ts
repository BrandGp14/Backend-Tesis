export class FileUploadResponse {
  data: FielUploadInformation;
}

export class FielUploadInformation {
  id: string;
  name: string;
  servers: string[];
  parentFolderCode: string;
}
