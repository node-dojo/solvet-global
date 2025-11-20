const { Command } = require('commander');
const chalk = require('chalk');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const repoCmd = new Command('repo');

// Repo status
repoCmd
  .command('status')
  .description('Status of all repositories')
  .action(async () => {
    console.log(chalk.cyan('\n📊 Repository Status\n'));

    const repos = ['solvet-system', 'no3d-tools-library', 'no3d-tools-website', 'no3d-tools-addon'];
    const basePath = process.cwd();

    repos.forEach(repo => {
      const repoPath = path.join(basePath, repo);
      if (!fs.existsSync(repoPath)) {
        console.log(chalk.red(`  ✗ ${repo} - Not found`));
        return;
      }

      try {
        const branch = execSync('git branch --show-current', { cwd: repoPath, encoding: 'utf8' }).trim();
        const status = execSync('git status -s', { cwd: repoPath, encoding: 'utf8' }).trim();
        const isClean = status === '';

        console.log(chalk.bold(`\n  📦 ${repo}`));
        console.log(`     Branch: ${chalk.cyan(branch)}`);
        console.log(`     Status: ${isClean ? chalk.green('Clean') : chalk.yellow('Modified')}`);
        
        if (!isClean) {
          const lines = status.split('\n').slice(0, 3);
          lines.forEach(line => {
            if (line) console.log(`     ${line}`);
          });
          if (status.split('\n').length > 3) {
            console.log(`     ... and more`);
          }
        }
      } catch (error) {
        console.log(chalk.red(`  ✗ ${repo} - Error: ${error.message}`));
      }
    });
    console.log();
  });

// Repo update
repoCmd
  .command('update')
  .description('Update all repositories')
  .action(async () => {
    console.log(chalk.cyan('\n🔄 Updating all repositories...\n'));

    const repos = ['solvet-system', 'no3d-tools-library', 'no3d-tools-website', 'no3d-tools-addon'];
    const basePath = process.cwd();

    repos.forEach(repo => {
      const repoPath = path.join(basePath, repo);
      if (!fs.existsSync(repoPath)) {
        console.log(chalk.yellow(`  ⚠️  ${repo} - Not found, skipping`));
        return;
      }

      try {
        console.log(chalk.cyan(`  📦 Updating ${repo}...`));
        execSync('git fetch --all', { cwd: repoPath, stdio: 'inherit' });
        const branch = execSync('git branch --show-current', { cwd: repoPath, encoding: 'utf8' }).trim();
        execSync(`git pull origin ${branch}`, { cwd: repoPath, stdio: 'inherit' });
        console.log(chalk.green(`  ✓ ${repo} updated\n`));
      } catch (error) {
        console.log(chalk.red(`  ✗ ${repo} - Error: ${error.message}\n`));
      }
    });
  });

module.exports = repoCmd;

