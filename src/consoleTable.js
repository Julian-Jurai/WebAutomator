import Table from "cli-table";

const formatTimeUnitToString = num => (num < 10 ? "0" + num.toString() : num);

const formatSeconds = secondsFloat => {
  const seconds = Math.floor(secondsFloat) % 60;
  const minutes = Math.floor((secondsFloat / 60) % 60);
  const hours = Math.floor(secondsFloat / (60 * 60));

  return (
    formatTimeUnitToString(hours) +
    ":" +
    formatTimeUnitToString(minutes) +
    ":" +
    formatTimeUnitToString(seconds)
  );
};

const calculateSessionTime = dateObj => {
  const secondsFloat = (new Date().getTime() - dateObj.getTime()) / 1000;
  return formatSeconds(secondsFloat);
};

const setPerformanceValues = performanceTableRow => {
  const uptime = process.uptime();
  const { heapUsed, heapTotal, external } = process.memoryUsage();

  performanceTableRow[0] = formatSeconds(uptime);
  performanceTableRow[1] =
    ((heapUsed + external) / heapTotal).toFixed(4) + " %";
};

function ConsoleTable() {
  // Bind console errors
  // const oGConsoleError = console.error;
  console.error = (...msg) => {
    this.setError(...msg);
    // oGConsoleError(...msg);
  };

  const tableRow = ["N/A", "N/A", "N/A", "N/A"];
  const performanceTableRow = ["N/A", "N/A"];
  const errorTableRow = ["N/A"];

  this.table = new Table({
    head: ["Wifi", "Internet", "Session Time", "Current Step"],
    colWidths: [10, 10, 15, 30]
  });

  this.performanceTable = new Table({
    head: ["Uptime (h:m:s)", "Memory Usage (% of heap)"],
    colWidths: [40, 27]
  });

  this.errorTable = new Table({
    head: ["Error Message"],
    colWidths: [68]
  });

  this.table.push(tableRow);
  this.performanceTable.push(performanceTableRow);
  this.errorTable.push(errorTableRow);

  this.setHasWifi = bool => (tableRow[0] = bool ? "✅" : "❌");
  this.setHasInternet = bool => (tableRow[1] = bool ? "✅" : "❌");
  this.setCurrentStep = stepName => (tableRow[3] = stepName || "N/A");
  this.resetCompletedAt = () => (this.completedAt = null);
  this.setCompletedAt = () => (this.completedAt = new Date());
  this.setSessionTime = () =>
    (tableRow[2] = this.completedAt
      ? calculateSessionTime(this.completedAt)
      : "N/A");
  this.setError = error => {
    errorTableRow[0] =
      error instanceof Error ? error.toString() : JSON.stringify(error);
  };
  this.print = () => {
    setPerformanceValues(performanceTableRow);
    this.setSessionTime();
    console.clear();
    console.log(this.table.toString());
    console.log(this.performanceTable.toString());
    console.log(this.errorTable.toString());
    process.stdout.write("\u001b[3J"); // clears scroll back
  };
}

const ConsoleTableInstance = new ConsoleTable();

export default ConsoleTableInstance;
