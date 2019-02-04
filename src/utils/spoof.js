import { exec } from "child_process";

export default () => {
  if (process.env.PASSWORD) {
    const cmd = `sudo -S <<< "${process.env.PASSWORD}" spoof randomize en0`;
    return new Promise((resolve, reject) => {
      exec(cmd, {}, (error, stdout, stderr) => {
        setTimeout(resolve, 2000);
      });
    });
  }
};
