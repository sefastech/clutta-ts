import { exec } from 'child_process';
import { CluttaConfig, Pulse } from './lib/types';
import { CluttaInstaller } from './lib/installer';

class Clutta {
  private apiKey: string;

  constructor(config: CluttaConfig) {
    this.apiKey = config.apiKey;

    new CluttaInstaller({ version: config.version });
  }

  sendPulse(pulse: Pulse) {
    const payload = {
      ...pulse,
      apiKey: this.apiKey,
    };
    const command = `clutta send pulse --json '${JSON.stringify(payload)}'`;
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }

  sendPulses(pulses: Pulse[]) {
    const command = `clutta send pulses --json '${JSON.stringify(pulses)}'`;
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      // console.log(`stderr: ${stderr}`);
    });
  }
}

export default Clutta;

const clutta = new Clutta({
  apiKey: 'AF4Rzz4Ww0KTt7nI.f23f5a44-fa59-4a77-b5cf-951a18fb4ccb',
  version: 'v0.0.10',
});


clutta.sendPulse(
  {
    signatureId: '1c5cfbed-25d7-463b-b430-8c59d729083f',
    correlationId: 'f3c8b24a-98a2-4757-bb85-6bc1d768f7e2',
    chainId: '3d6b57ec-43e4-43cd-88cc-e686288e0a05',
    userId: 'wunmi@gmail.com',
    sourceId: 'profile',
    status: 1,
    statusDescription: 'Success',
  },
 
);

