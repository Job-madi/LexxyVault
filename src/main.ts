import { backupCommand } from './commands/backup.js';
const program = new Command();
import 'dotenv/config'


program.name('lexxy')
  .version('0.0.0')
  .command('hello')
  .description('Cli tool to backup your files')


program.addCommand(backupCommand);


program.parse(process.argv);
