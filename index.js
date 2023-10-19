import FindFiles from "./FindFiles.js";
import inquirer from "inquirer";
import chalk from "chalk";
import process from "process";
import DeleteFiles from "./DeleteFiles.js";

// Instantiate FindFiles and DeleteFiles classes
const finder = new FindFiles();
const deleter = new DeleteFiles();

/**
 * Function to initiate the search for node_modules directories.
 * @param {string} path - The starting path for the search.
 */
async function startSearch(path) {
  console.log("Searching for node_modules directories...");
  await finder.search(path, 10, () => {});
  console.log(chalk.green("Search completed successfully."));
  console.log(chalk.yellow(finder.filesList));

  showOptions();
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
 * Function to handle user input for the path to start searching node_modules directories.
 */
function optionsStartSearch() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "path",
        message:
          "Enter the path to start searching for node_modules directories:",
        validate: (input) => input.trim() !== "",
        default: process.cwd(),
      },
    ])
    .then((answers) => {
      const path = answers.path;
      startSearch(path);
    });
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

  // Add selected directories to the delete queue and delete them
  answers.filesToDelete.forEach((path) => {
    deleter.addFileToDelete(path);
  });

  await deleter.deleteAllFiles();

  console.log(chalk.green("Node_modules directories deleted successfully."));

  showOptions();
}

showOptions();
