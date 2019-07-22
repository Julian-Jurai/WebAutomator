import Table from "cli-table";

const getTimeStamp = () => {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

function ConsoleTable() {
  // Bind console errors
  // const oGConsoleError = console.error;
  console.error = (...msg) => {
    this.setError(...msg);
    // oGConsoleError(...msg);
  };

  const tableHeader = [
    "Timestamp",
    "Wifi",
    "Internet",
    "Current Step",
    "Error Message"
  ];
  const tableRow = ["N/A", "N/A", "N/A", "N/A", "N/A"];

  this.table = new Table({
    head: tableHeader,
    colWidths: [13, 8, 10, 30, 40]
  });

  this.table.push(tableRow);

  this.setHasWifi = bool => (tableRow[1] = bool ? "✅" : "❌");
  this.setHasInternet = bool => (tableRow[2] = bool ? "✅" : "❌");
  this.setCurrentStep = stepName => (tableRow[3] = stepName || "N/A");
  this.setError = msg => (tableRow[4] = msg && JSON.stringify(msg) || "N/A");
  this.print = () => {
    tableRow[0] = getTimeStamp();
    console.clear() //TODO Doesn't clear scroll back

    console.log(this.table.toString());
  };
}

const ConsoleTableInstance = new ConsoleTable();

export default ConsoleTableInstance;
