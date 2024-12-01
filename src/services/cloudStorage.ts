import {
  Bucket,
  CreateBucketResponse,
  DeleteFileResponse,
  File,
  GetSignedUrlResponse,
  Storage,
} from '@google-cloud/storage';

export class CloudStorageRepository {
  private storage: Storage;
  private bucketName: string;
  private bucket: Bucket;

  constructor(bucketName: string) {
    this.storage = new Storage({
      projectId: process.env.PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.bucket = this.storage.bucket(bucketName);
  }

  async createBucket(): Promise<CreateBucketResponse> {
    const exists = await this.bucket.exists();
    if (exists[0]) {
      throw new Error(`Bucket ${this.bucket.name} already exists`);
    }
    return await this.storage.createBucket(this.bucketName);
  }

  //get signgurel to display after bucket creation
  async getBucketUrl(): Promise<{
    signedUrl: GetSignedUrlResponse;
    expires: Date;
  }> {
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    const signedUrl = await this.bucket.getSignedUrl({
      action: 'list',
      expires: expires,
    });

    return {
      signedUrl,
      expires,
    };
  }

  async getFileUrl(fileName: string): Promise<{
    signedUrl: GetSignedUrlResponse;
    expires: Date;
  }> {
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    const signedUrl = await this.bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: expires,
    });

    return {
      signedUrl,
      expires,
    };
  }

  //Todo: implment pagination
  async listfiles(bucketName: string): Promise<File[]> {
    const [files] = await this.storage.bucket(bucketName).getFiles();
    return files;
  }

  async deleteFilesInFolder(bucketName: string, prefix: string): Promise<void> {
    //todo: check if files exist before deleting

    const options: { force: boolean; prefix?: string } = { force: true };
    // Add prefix only if it is valid
    if (prefix && prefix.trim() !== '') {
      options.prefix = prefix;
    }
    //if prefix is not provided, all files are in the bucket are deleted

    await this.storage.bucket(bucketName).deleteFiles(options);
  }

  async deletefile(fileName:string): Promise<DeleteFileResponse>{
    if(!this.fileExists(fileName)){
      throw new Error(`File ${fileName} does not exist`);
    }
    return await this.bucket.file(fileName).delete();
  }

  async fileExists(fileName: string): Promise<boolean> {
    const [exists] = await this.bucket.file(fileName).exists();
    return exists;
  }


  //Todo: Resumable uploads for large files
  //Todo: Normal uploads for small files : When uploading files less than 10MB, it is recommended that the resumable feature is disabled.
  //Todo: Upload Progress Monitoring
  //Todo: Remember for multiple file upload, we need to use the tranfserManager and goes for downloads too!




//Todo:In Future we can work on wheather user wants to make files or folers public or private + Retenion Period










}
