import os from 'os';
import fs from 'fs';
import https from 'https';
import {  execFile } from 'child_process';
import path from 'path';
import { InstallerConfig } from './types';

export class CluttaInstaller {
  private cluttaInstallDir: string;
  private appName: string = 'clutta';
  private cliVersion: string;
  private binaryBaseUrl: string =
    'https://github.com/sefastech/clutta-cli-releases/releases/download/';

  constructor(installerConfig: InstallerConfig) {
    this.cliVersion = installerConfig.version;
    this.cluttaInstallDir =
      os.platform() === 'win32'
        ? `C:\\Program Files\\${this.appName}\\bin`
        : '/usr/local/bin';

    this.install();
  }

  private cliBinaries: Record<string, Record<string, string>> = {
    win32: {
      x64: 'clutta-cli_windows_amd64.exe',
      arm64: 'clutta-cli_windows_arm64.exe',
    },
    darwin: {
      x64: 'clutta-cli_darwin_amd64',
      arm64: 'clutta-cli_darwin_arm64',
    },
    linux: {
      x64: 'clutta-cli_linux_amd64',
      arm64: 'clutta-cli_linux_arm64',
    },
  };

  private getCluttaBinary(): string {
    const platform = os.platform();
    const arch = os.arch();

    if (platform in this.cliBinaries && arch in this.cliBinaries[platform]) {
      return this.cliBinaries[platform][arch];
    }

    throw new Error(
      `Unsupported platform or architecture: ${platform} - ${arch}`
    );
  }

  private installCluttaBinary(url: string, dest: string, callback: () => void) {
    const file = fs.createWriteStream(dest);

    console.log('Downloading clutta binary from:', url);

    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const redirectUrl = response.headers['location'] as string;

          this.installCluttaBinary(redirectUrl, dest, callback); // Follow the redirect
        } else if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(callback);
          });
        } else {
          console.error(
            `Failed to get the clutta binary. Status code: ${response.statusCode}`
          );
        }
      })
      .on('error', (err) => {
        console.error('Fetching clutta binary failed:', err);
      });
  }

  private makeExecutable(filePath: string) {
    fs.chmod(filePath, 0o755, (err) => {
      if (err) {
        console.error('Failed to make file executable:', err);
      } else {
        console.log(`Successfully made ${filePath} executable.`);
      }
    });
  }
  private async startInstallation(installDir: string) {
    // First, check if the destination directory exists
    if (fs.existsSync(installDir)) {
      // remove the existing clutta binary
      fs.rmSync(installDir);
    }

    try {
      fs.mkdirSync(this.cluttaInstallDir, { recursive: true });
    } catch (error) {
      console.error('Error initializing clutta:', error);
      return;
    }

    const binaryUrl = `${this.binaryBaseUrl}${
      this.cliVersion
    }/${this.getCluttaBinary()}`;

    this.installCluttaBinary(binaryUrl, installDir, () => {
      this.makeExecutable(installDir);
      console.log(`${this.appName} initialized successfully.`);
    });
  }

  private async install() {
    const installDir = path.join(this.cluttaInstallDir, this.appName);

    if (fs.existsSync(installDir)) {
      execFile(`clutta`, ['--version'], (error, stdout, stderr) => {
       
        if (stdout.includes(this.cliVersion)) {
          console.log(
            `${this.appName} ${this.cliVersion} is already installed.`
          );
          return;
        } else {
          this.startInstallation(installDir);
        }
      });
    } else {
      this.startInstallation(installDir);
    }
  }
}
