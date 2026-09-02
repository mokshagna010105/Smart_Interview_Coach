/**
 * Abstract Storage Provider Interface
 */
export class StorageProvider {
  /**
   * Save a file buffer to storage
   * @param {Buffer} buffer
   * @param {string} originalFilename
   * @param {string} mimeType
   * @returns {Promise<{ storageKey: string, fileUrl: string, fileSize: number }>}
   */
  async saveFile(buffer, originalFilename, mimeType) {
    throw new Error('saveFile method must be implemented by concrete StorageProvider');
  }

  /**
   * Retrieve file buffer from storage
   * @param {string} storageKey
   * @returns {Promise<Buffer>}
   */
  async getFile(storageKey) {
    throw new Error('getFile method must be implemented by concrete StorageProvider');
  }

  /**
   * Delete a file from storage
   * @param {string} storageKey
   * @returns {Promise<boolean>}
   */
  async deleteFile(storageKey) {
    throw new Error('deleteFile method must be implemented by concrete StorageProvider');
  }
}

export default StorageProvider;
