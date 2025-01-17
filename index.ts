import os from 'os';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { exec } from 'child_process';

interface CluttaConfig {
  apiKey: string;
}

interface Pulse {
  signatureId: string;
  chainId: string;
  correlationId: string;
  sourceId: string;
  userId: string;
  status: number;
  statusDescription: string;
}

class Clutta {
  private cluttaInstallDir: string;
  private appName: string = 'clutta';
  private cliVersion: string = '0.0.8';
  private apiKey: string;
  private binaryBaseUrl: string =
    'https://github.com/clutta/clutta-cli/releases/download/';
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



  constructor(config: CluttaConfig) {
    this.cluttaInstallDir =
      os.platform() === 'win32'
        ? `C:\\Program Files\\${this.appName}\\bin`
        : '/usr/local/bin';

    this.apiKey = config.apiKey;
  }

  getCluttaBinary(): string {
    const platform = os.platform();
    const arch = os.arch();

    if (platform in this.cliBinaries && arch in this.cliBinaries[platform]) {
      return this.cliBinaries[platform][arch];
    }

    throw new Error(
      `Unsupported platform or architecture: ${platform} - ${arch}`
    );
  }

  installCluttaBinary(url: string, dest: string, callback: () => void) {
    const file = fs.createWriteStream(dest);

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

  makeExecutable(filePath: string) {
    fs.chmod(filePath, 0o755, (err) => {
      if (err) {
        console.error('Failed to make file executable:', err);
      } else {
        console.log(`Successfully made ${filePath} executable.`);
      }
    });
  }

  init() {
    const installDir = path.join(this.cluttaInstallDir, this.appName);

    if (fs.existsSync(installDir)) {
      console.log(`${this.appName} initialized successfully.`);
      return;
    }

    // First, check if the destination directory exists
    if (!fs.existsSync(this.cluttaInstallDir)) {
      try {
        fs.mkdirSync(this.cluttaInstallDir, { recursive: true });
      } catch (error) {
        console.error('Error initializing clutta:', error);
        return;
      }
    }

    const binaryUrl = `${this.binaryBaseUrl}${
      this.cliVersion
    }/${this.getCluttaBinary()}`;

    this.installCluttaBinary(binaryUrl, installDir, () => {
      this.makeExecutable(installDir);
      console.log(`${this.appName} initialized successfully.`);
    });
  }

  sendPulse(pulse: Pulse) {
    const payload = {
      ...pulse,
      apiKey: this.apiKey,
    };
    const command = `clutta send pulse --json '${JSON.stringify(payload)}'`;;
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
}

export default Clutta