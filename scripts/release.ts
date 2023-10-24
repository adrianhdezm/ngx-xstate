import { execSync } from 'child_process';
import * as semver from 'semver';
import * as path from 'path';
import * as fs from 'fs';

const rootDir: string = path.join(__dirname, '..');
const pkgFilePath: string = path.join(rootDir, 'package.json');
const packageJson: Record<string, unknown> = JSON.parse(fs.readFileSync(pkgFilePath).toString());
const libPkgFilePath: string = path.join(rootDir, 'dist/libs/ngx-xstate', 'package.json');
const libPackageJson: Record<string, unknown> = JSON.parse(fs.readFileSync(libPkgFilePath).toString());
const pkgLockFilePath: string = path.join(rootDir, 'package-lock.json');
const packageLockJson: Record<string, unknown> = JSON.parse(fs.readFileSync(pkgLockFilePath).toString());

// Get the ReleaseType as a command line argument
const releaseType = process.argv[2] as semver.ReleaseType;

// Check if the ReleaseType is allowed
if (!releaseType || !['patch', 'minor', 'major'].includes(releaseType)) {
  console.error(`Invalid ReleaseType "${releaseType}". Allowed values are: ${['patch', 'minor', 'major'].join(', ')}`);
  process.exit(1);
}

const currentVersion = packageJson.version as string;
const newVersion: string = semver.inc(currentVersion, releaseType) as string;

const tagName: string = `v${newVersion}`;

// Check if the tag already exists locally
const tagExistsLocally: boolean = execSync(`git tag --list "${tagName}"`).toString().trim() !== '';
if (tagExistsLocally) {
  console.error(`Tag "${tagName}" already exists locally. Please delete it and try again.`);
  process.exit(1);
}

// Check if the tag already exists on remote
const tagExistsOnRemote: boolean = execSync(`git ls-remote --tags origin "${tagName}"`).toString().trim() !== '';
if (tagExistsOnRemote) {
  console.error(`Tag "${newVersion}" already exists on remote. Please delete it and try again.`);
  process.exit(1);
}

// Update package.json with new version
packageJson.version = newVersion;
fs.writeFileSync(pkgFilePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update lib package.json with new version
libPackageJson.version = newVersion;
fs.writeFileSync(libPkgFilePath, JSON.stringify(libPackageJson, null, 2) + '\n');

// Update package-lock.json with new version
packageLockJson.version = newVersion;
fs.writeFileSync(pkgLockFilePath, JSON.stringify(packageLockJson, null, 2) + '\n');

// Commit changes in package.json and package-lock.json files
execSync(`git commit -am "Bump version to ${newVersion}"`);

// Push the changes to remote
execSync(`git push`);

// Create a new git tag
const tagMessage: string = `Release ${tagName}`;
execSync(`git tag -a ${tagName} -m "${tagMessage}"`);

// Push the new tag to remote
execSync(`git push origin ${tagName}`);
