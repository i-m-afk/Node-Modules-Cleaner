import fs from "fs/promises";

/**
 * A utility class for deleting files and directories.
 */
export default class DeleteFiles {
  /**
   * Array to store paths of files and directories to be deleted.
   * @type {string[]}
   */
  filesToDelete = [];

  /**
   * Deletes a directory at the specified path.
   * @param {string} path - The path of the directory to be deleted.
   * @return {Promise<void>} - A Promise that resolves when the directory is deleted.
   */
  async deleteDirectory(path) {
    try {
      await fs.rm(path, { recursive: true });
    } catch (err) {
      console.error(`Error deleting "${path}" : ${err.message}`);
    }
  }

  /**
   * Deletes all files and directories stored in the filesToDelete array.
   * @return {Promise<void>} - A Promise that resolves when all files and directories are deleted.
   */
  async deleteAllFiles() {
    while (this.filesToDelete.length !== 0) {
      await this.deleteDirectory(this.filesToDelete.pop());
    }
  }

  /**
   * Adds a file or directory path to the list of items to be deleted.
   * @param {string} path - The path of the file or directory to be deleted.
   */
  addFileToDelete(path) {
    this.filesToDelete.push(path);
  }
}
