import { Command } from 'commander';
import fileSelector from 'inquirer-file-selector';
import  logger  from '../utils/logger.js';
import { CloudStorageRepository } from '../services/cloudStorage.js';


export const backupCommand = new Command()
  .command('backup')
  .description('Backup your files to Google Cloud Storage')
  .action(async () => {
    try {
      const filePath = await fileSelector({
        message: 'Select a file to upload:',
        type: 'file+directory',
      });

      if (!filePath) {
        logger.info('No file selected. Backup canceled.');
        return;
      }

      const fileName = filePath.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid file name');
      }

      logger.info(`Uploading ${fileName} from ${filePath}...`);

      const repository = new CloudStorageRepository('lexxy-backup');

      await repository.uploadFile(fileName, filePath, (progress) => {
        logger.info(progress);
      });

      logger.info('\nUpload completed successfully!');
    } catch (error) {
      logger.error(`Error during backup: ${error.message}`);
    }
  });
