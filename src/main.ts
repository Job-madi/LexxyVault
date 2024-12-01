import {Command} from 'commander';
const program = new Command();
import 'dotenv/config'


program.name('lexxy')
  .version('0.0.0')
  .command('hello')
  .description('Cli tool to backup your files')



  // .action(backupCommand);




program.parse(process.argv);
