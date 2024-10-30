import { Stats } from "fs";
import fs from "fs/promises";
import { resolve } from "path";

/**
 *
 * A utility class for searching and storing node_modules directories in a given path.
 */
export default class FindFiles {
  /**
   * List of discovered node_modules directories.
   * @type {string[]}
   */
  filesList = [];

  /**
   * Recursively searches for node_modules directories in the specified path.
   * @param {string} path - The path to start searching for node_modules directories.
   * @param {number} depth - The maximum depth of the recurrsive search
   * @param {CallableFunction} callback - A callback that executes on completion of search
   * @returns {Promise<void>} - A Promise that resolves once the search is completed.
   *
   */
  async search(path, depth = 10, onComplete = () => {}) {
    try {
      const dirs = await fs.readdir(path);
      await this.find(path, dirs, depth);
      onComplete();
    } catch (err) {
      console.error(`Error while searching for node_modules: ${err.message}`);
    }
  }

  /**
   * Recursively searches for node_modules directories in the given path and its subdirectories.
   * @param {string} path - The current path being searched.
   * @param {string[]} dirs - The list of directories in the current path.
   * @param {number} depth - The remaining depth of the recursive search
   * @returns {Promise<void>} - A Promise that resolves once the search in the current path is completed.
   */
  async find(path, dirs, depth) {
    for (const dir of dirs) {
      try {
        if (!this.isHiddenDirectory(dir)) {
          const currentPath = resolve(path, dir);
          const stats = await fs.stat(currentPath);
          if (this.isNodeModuleFolder(stats, dir)) {
            this.storeFiles(currentPath);
          } else if (stats.isDirectory() && depth > 0) {
            const subDirs = await fs.readdir(currentPath);
            await this.find(currentPath, subDirs, depth - 1);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Checks if a directory is hidden.
   * @param {string} dir - The directory name.
   * @returns {boolean} - Returns true if the directory is hidden, otherwise false.
   */
  isHiddenDirectory(dir) {
    return dir.startsWith(".");
  }

  /**
   * Checks if a directory is a node_modules folder.
   * @param {Stats} stats - The statistics of the file.
   * @param {string} dir - The directory name.
   * @returns {boolean} - Returns true if the directory is a node_modules folder, otherwise false.
   */
  isNodeModuleFolder(stats, dir) {
    return stats.isDirectory() && dir === "node_modules";
  }

  /**
   * Stores the path of a node_modules directory in the filesList.
   * @param {string} currentPath - The path of the node_modules directory to be stored.
   */
  storeFiles(currentPath) {
    this.filesList.push(currentPath);
  }
}
