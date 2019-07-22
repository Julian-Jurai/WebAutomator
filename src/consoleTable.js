import Table from "cli-table";

const ConsoleTable = () => {
  const tableHeader = ["Wifi", "Internet", "Timestamp", "Current Step"];
  const tableRow = ["N/A", "N/A", "N/A", "N/A"];
  const table = new Table({
    head: tableHeader
  });

  table.push(tableRow);

  this.setHasWifi = bool => (tableRow[0] = bool ? "✅" : "❌");
  this.setHasInternet = bool => (tableRow[1] = bool ? "✅" : "❌");
  this.setCurrentStep = stepName => (tableRow[3] = stepName || "N/A");
  this.print = () => {
    tableRow[2] = new Date().getTime();
    table.toString();
  };
};

const ConsoleTableInstance = new ConsoleTable();

export default ConsoleTableInstance;
