import { exec } from "child_process";
import { CluttaConfig, Pulse } from "./lib/types";

class Clutta {
  private apiKey: string;

  constructor(config: CluttaConfig) {
    this.apiKey = config.apiKey;
  }

  sendPulse(pulse: Pulse) {
    const payload = {
      ...pulse,
      apiKey: this.apiKey,
    };
    const command = `clutta send pulse --json '${JSON.stringify(payload)}'`;
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout} stderr: ${stderr}`);
    });
  }

  sendPulses(pulses: Pulse[]) {
    const command = `clutta send pulses --json '${JSON.stringify(pulses)}'`;
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
    });
  }
}

export default Clutta;
