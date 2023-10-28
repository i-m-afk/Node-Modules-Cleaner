import FindFiles from "./FindFiles.js";
import inquirer from "inquirer";
import chalk from "chalk";
import process from "process";
import DeleteFiles from "./DeleteFiles.js";
import FolderSize from "./FolderSize.js";

// Instantiate FindFiles, DeleteFiles, FolderSize classes
const finder = new FindFiles();
const deleter = new DeleteFiles();
const folderSizes = new FolderSize();

/**
 * Function to initiate the search for node_modules directories.
 * @param {string} path - The starting path for the search.
 */
async function startSearch(path, depth) {
  finder.filesList = [];
  deleter.filesToDelete = [];
  folderSizes.folders = [];

  console.log("Searching for node_modules directories...");
  await finder.search(path, depth, () => {});
  console.log(chalk.green("Search completed successfully."));

  console.log(chalk.yellow(`Total files found: ${finder.filesList.length}`));
  console.log(chalk.yellow(finder.filesList));

  showOptions();

  await folderSizes.storeFileSize(finder.filesList);
}

/**
 * Function to display the main options menu and handle user choices.
 */
function showOptions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Choose an option:",
        choices: [
          "Search for node_modules directories",
          "Delete found node_modules directories",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      if (answers.option === "Search for node_modules directories") {
        optionsStartSearch();
      } else if (answers.option === "Delete found node_modules directories") {
        startDelete();
      } else {
        console.log(chalk.blue("Goodbye!"));
        process.exit(0);
      }
    });
}

/**
 * Array of questions to prompt the user to start searching for node_modules directories.
 */
const choicesForOptionStartSearch = [
  {
    type: "input",
    name: "path",
    message: "Enter the path to start searching for node_modules directories:",
    validate: (input) => input.trim() !== "",
    default: process.cwd(),
  },
  {
    type: "list",
    name: "depthChoice",
    message: "Enter the depth of the search:",
    choices: ["low", "medium", "high", "custom"],
    when: (answers) => answers.depthChoice !== "custom",
  },
  {
    type: "input",
    name: "customDepth",
    message: "Enter the custom depth of the search:",
    validate: (input) => input.trim() !== "",
    when: (answers) => answers.depthChoice === "custom",
    default: 10,
  },
];

/**
 * Function to handle user input for the path to start searching node_modules directories.
 */
function optionsStartSearch() {
  inquirer.prompt(choicesForOptionStartSearch).then((answers) => {
    const path = answers.path;
    let depth =
      answers.depthChoice === "custom"
        ? answers.customDepth
        : answers.depthChoice;
    depth = getDepth(depth);
    startSearch(path, depth);
  });
}

/**
 * Function to convert the depth string to a number.
 */
function getDepth(depth) {
  switch (depth) {
    case "low":
      return 5;
    case "medium":
      return 10;
    case "high":
      return 20;
    default:
      return parseInt(depth);
  }
}

/**
 * Function to initiate the deletion of selected node_modules directories.
 */
async function startDelete() {
  if (finder.filesList.length === 0) {
    console.log(chalk.yellow("No node_modules directories found."));
    showOptions();
  } else {
    // If node_modules directories are found, prompt user to select directories for deletion
    selectFilesToDelete();
  }
}

/**
 * Function to prompt the user to select node_modules directories for deletion.
 */
async function selectFilesToDelete() {
  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "filesToDelete",
      message:
        "Select the node_modules directories to delete: (space to select and enter to confirm)",
      choices: finder.filesList,
    },
  ]);

  answers.filesToDelete.forEach((path) => {
    deleter.addFileToDelete(path);
    folderSizes.folders.forEach((folder) => {
      if (folder.path === path) {
        folder.isDeleted = true;
      }
    });
  });

  await deleter.deleteAllFiles();

  console.log(
    chalk.yellow("Total size of node_modules directories:"),
    chalk.red(folderSizes.formatSize(folderSizes.totalSize))
  );
  console.log(
    chalk.green("Selected node_modules directories deleted successfully.")
  );

  console.log(
    chalk.yellow("Total storage freed:"),
    chalk.red(folderSizes.formatSize(folderSizes.getDeletedSize()))
  );

  showOptions();
}

showOptions();
