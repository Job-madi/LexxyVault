import {
  Bucket,
  CreateBucketResponse,
  DeleteFileResponse,
  File,
  GetSignedUrlResponse,
  Storage,
} from '@google-cloud/storage';
import fs from 'fs';

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

  async deletefile(fileName: string): Promise<DeleteFileResponse> {
    if (!this.fileExists(fileName)) {
      throw new Error(`File ${fileName} does not exist`);
    }
    return await this.bucket.file(fileName).delete();
  }

  async fileExists(fileName: string): Promise<boolean> {
    const [exists] = await this.bucket.file(fileName).exists();
    return exists;
  }

  async uploadFile(
    fileName: string,
    filePath: string,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} does not exist`);
    }

    const stats = fs.statSync(filePath);
    const totalSize = stats.size;
    let uploadedSize = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .on('data', (chunk) => {
          uploadedSize += chunk.length;
          const progress = (uploadedSize / totalSize) * 100;

          if (onProgress) {
            onProgress(progress);
          }
        })
        .pipe(this.bucket.file(fileName).createWriteStream())
        .on('error', (err) => {
          reject(new Error(`Error uploading file ${fileName}: ${err.message}`));
        })
        .on('finish', () => {
          resolve();
        });
    });
  }

  //Todo: Resumable uploads for large files
  //Todo: Normal uploads for small files : When uploading files less than 10MB, it is recommended that the resumable feature is disabled.
  //Todo: Upload Progress Monitoring
  //Todo: Remember for multiple file upload, we need to use the tranfserManager and goes for downloads too!

  //Todo:In Future we can work on wheather user wants to make files or folers public or private + Retenion Period

  /* Todo: Docs
Integrity checks
We recommend that you request an integrity check of the final uploaded object to be sure that it matches the source file. You can do this by calculating the MD5 digest of the source file and adding it to the Content-MD5 request header.

Checking the integrity of the uploaded file is particularly important if you are uploading a large file over a long period of time, because there is an increased likelihood of the source file being modified over the course of the upload operation.

*/
}
