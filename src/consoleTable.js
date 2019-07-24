import Table from "cli-table";

const setPerformanceValues = performanceTableRow => {
  performanceTableRow[0] = process.uptime();

  const { heapUsed, heapTotal, external } = process.memoryUsage();

  performanceTableRow[1] = ((heapUsed + external) / heapTotal).toFixed(4) + "%";
};

function ConsoleTable() {
  // Bind console errors
  // const oGConsoleError = console.error;
  console.error = (...msg) => {
    this.setError(...msg);
    // oGConsoleError(...msg);
  };

  const tableRow = ["N/A", "N/A", "N/A"];
  const performanceTableRow = ["N/A", "N/A"];
  const errorTableRow = ["N/A"];

  this.table = new Table({
    head: ["Wifi", "Internet", "Current Step"],
    colWidths: [10, 10, 30]
  });

  this.performanceTable = new Table({
    head: ["Uptime (s)", "Memory Usage (% rss)"],
    colWidths: [25, 26]
  });

  this.errorTable = new Table({
    head: ["Error Message"],
    colWidths: [52]
  });

  this.table.push(tableRow);
  this.performanceTable.push(performanceTableRow);
  this.errorTable.push(errorTableRow);

  this.setHasWifi = bool => (tableRow[0] = bool ? "✅" : "❌");
  this.setHasInternet = bool => (tableRow[1] = bool ? "✅" : "❌");
  this.setCurrentStep = stepName => (tableRow[2] = stepName || "N/A");
  this.setError = error => {
    errorTableRow[0] = error instanceof Error ? error.toString() : error;
  };
  this.print = () => {
    setPerformanceValues(performanceTableRow);
    console.clear(); //TODO Doesn't clear scroll back

    console.log(this.table.toString());
    console.log(this.performanceTable.toString());
    console.log(this.errorTable.toString());
  };
}

const ConsoleTableInstance = new ConsoleTable();

export default ConsoleTableInstance;
