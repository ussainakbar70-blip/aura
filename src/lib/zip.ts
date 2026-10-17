/**
 * Pure TypeScript In-Browser ZIP Archive Generator
 * Zero dependencies. Generates valid standard PKZip (.zip) archives that work
 * with all operating systems (Windows Explorer, macOS Archive Utility, Linux, 7-Zip).
 */

// CRC-32 Lookup Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  name: string;
  content: string | Uint8Array;
}

/**
 * Creates a valid uncompressed (Store method) ZIP archive from a list of files.
 */
export function createZipArchive(files: ZipFileInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const fileEntries: {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  const localHeaders: Uint8Array[] = [];
  let currentOffset = 0;

  // 1. Process files and build local headers & file contents
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const crc = calculateCrc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    // Local file header signature: 0x04034b50
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true); // Version needed: 2.0
    view.setUint16(6, 0x0800, true); // Flags: UTF-8 filename (bit 11)
    view.setUint16(8, 0, true); // Compression method: 0 (Store)
    view.setUint16(10, 0, true); // File last mod time
    view.setUint16(12, 0, true); // File last mod date
    view.setUint32(14, crc, true); // CRC-32
    view.setUint32(18, dataBytes.length, true); // Compressed size
    view.setUint32(22, dataBytes.length, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true); // Extra field length

    localHeader.set(nameBytes, 30);

    fileEntries.push({
      nameBytes,
      dataBytes,
      crc,
      offset: currentOffset,
    });

    localHeaders.push(localHeader);
    currentOffset += localHeader.length + dataBytes.length;
  }

  // 2. Build Central Directory
  const centralDirHeaders: Uint8Array[] = [];
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    // Central directory file header signature: 0x02014b50
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true); // Version made by: 2.0
    view.setUint16(6, 20, true); // Version needed: 2.0
    view.setUint16(8, 0x0800, true); // Flags: UTF-8 filename (bit 11)
    view.setUint16(10, 0, true); // Compression method: 0
    view.setUint16(12, 0, true); // Last mod time
    view.setUint16(14, 0, true); // Last mod date
    view.setUint32(16, entry.crc, true); // CRC-32
    view.setUint32(20, entry.dataBytes.length, true); // Compressed size
    view.setUint32(24, entry.dataBytes.length, true); // Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // File name length
    view.setUint16(30, 0, true); // Extra field length
    view.setUint16(32, 0, true); // File comment length
    view.setUint16(34, 0, true); // Disk number start
    view.setUint16(36, 0, true); // Internal file attributes
    view.setUint32(38, 0, true); // External file attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header

    cdHeader.set(entry.nameBytes, 46);

    centralDirHeaders.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // 3. Build End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  // EOCD signature: 0x06054b50
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true); // Disk number
  eocdView.setUint16(6, 0, true); // Disk where central directory starts
  eocdView.setUint16(8, fileEntries.length, true); // Total entries on this disk
  eocdView.setUint16(10, fileEntries.length, true); // Total entries in central directory
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, currentOffset, true); // Offset of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  // 4. Combine all chunks into single Uint8Array
  const totalLength = currentOffset + centralDirSize + 22;
  const result = new Uint8Array(totalLength);
  let pos = 0;

  for (let i = 0; i < fileEntries.length; i++) {
    result.set(localHeaders[i], pos);
    pos += localHeaders[i].length;
    result.set(fileEntries[i].dataBytes, pos);
    pos += fileEntries[i].dataBytes.length;
  }

  for (const cdHeader of centralDirHeaders) {
    result.set(cdHeader, pos);
    pos += cdHeader.length;
  }

  result.set(eocd, pos);
  return result;
}

/**
 * Triggers a browser download of the generated ZIP archive.
 */
export function downloadZipFile(filename: string, files: ZipFileInput[]) {
  const zipBytes = createZipArchive(files);
  const blob = new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
