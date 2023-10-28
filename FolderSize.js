import { resolve } from "path";
import fs from "fs/promises";

/**
 * Recursively calculates the size of a folder.
 * @param {string} path - The path to the folder.
 * @returns {Promise<number>} - A Promise that resolves with the size of the folder in bytes.
 */
async function getFolderSize(path) {
  let size = 0;
  const dirs = await fs.readdir(path);

  for (const dir of dirs) {
    const currentPath = resolve(path, dir);
    const stats = await fs.stat(currentPath);

    if (stats.isDirectory()) {
      size += await getFolderSize(currentPath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

/**
 * Class for calculating and managing folder sizes.
 */
export default class FolderSize {
  folders = [];
  totalSize = 0; // Total size of all folders in bytes

  /**
   * Calculates the size of a folder.
   * @param {string} path - The path to the folder.
   * @returns {Promise<number>} - A Promise that resolves with the size of the folder in bytes.
   */
  async getSize(path) {
    const size = await getFolderSize(path);
    return size;
  }

  /**
   * Formats the folder size from bytes to MB.
   * @param {number} size - The size of the folder in bytes.
   * @returns {string} - The size of the folder in MB.
   */
  formatSize(size) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  /**
   * Stores the sizes of specified folders.
   * @param {string[]} paths - The paths to the folders.
   * @returns {Promise<void>} - A Promise that resolves once the sizes are calculated and stored.
   */
  async storeFileSize(paths) {
    for (const path of paths) {
      const size = await getFolderSize(path);
      this.folders.push({ path: path, size: size, isDeleted: false });
    }
    this.calculateTotalSize();
  }

  /**
   * Calculates and sets the total size of all folders.
   */
  calculateTotalSize() {
    this.totalSize = this.folders.reduce(
      (total, folder) => total + folder.size,
      0
    );
  }

  /**
   * Gets the total size of all deleted folders.
   * @returns {number} - The size of the deleted folders in bytes.
   */
  getDeletedSize() {
    return this.folders.reduce((deletedSize, folder) => {
      return folder.isDeleted ? deletedSize + folder.size : deletedSize;
    }, 0);
  }
}
