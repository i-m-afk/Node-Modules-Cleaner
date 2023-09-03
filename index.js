import process from "process";
import { resolve } from "path";
import fs from "fs/promises";
import readline from "readline";

// get size of the directory
async function getDirectorySize(path) {
  let totalSize = 0;
  const files = await fs.readdir(path);
  for (const file of files) {
    const currentPath = resolve(path, file);
    const stats = await fs.stat(currentPath);

    if (stats.isDirectory()) {
      totalSize += await getDirectorySize(currentPath);
    } else {
      totalSize += stats.size;
    }
  }
  return totalSize;
}

// confirm deletion
async function confirmDeletion(path) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`Confirm delete '${path}'? (y/n): `, (input) => {
      resolve(input);
      rl.close();
    });
  });
}

// delete directory
async function deleteDirectory(path) {
  try {
    await fs.rm(path, { recursive: true });
    console.log(`Directory '${path}' deleted`);
  } catch (err) {
    console.error(`Error deleting '${path}': ${err.message}`);
  }
}

// find and delete node_modules
async function findAndDeleteNodeModules(path) {
  try {
    const dirs = await fs.readdir(path);

    // traverse the current directory and run the command
    for (const dir of dirs) {
      // skip hidden directories
      if (dir.startsWith(".")) {
        continue;
      }

      const currentPath = resolve(path, dir);
      const stats = await fs.stat(currentPath);

      if (stats.isDirectory()) {
        if (dir === "node_modules") {
          console.log("Found node_modules:", currentPath);
          const answer = await confirmDeletion(currentPath);

          if (answer.toLowerCase() === "y") {
            await deleteDirectory(currentPath);
          } else {
            console.log("Not deleted:", currentPath);
          }
        } else {
          await findAndDeleteNodeModules(currentPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error while searching for node_modules: ${err.message}`);
  }
}

(async () => {
  const currentPath = process.cwd();
  let totalSize = 0;

  await findAndDeleteNodeModules(currentPath);
  totalSize = await getDirectorySize(currentPath);

  console.log(`Total file size: ${totalSize / 1024 / 1024} MB`);
})();
