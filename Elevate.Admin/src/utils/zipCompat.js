const ZIP_LOCAL_HEADER_SIGNATURE = 0x04034b50
const ZIP_CENTRAL_HEADER_SIGNATURE = 0x02014b50
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50
const ZIP_UTF8_FILENAME_FLAG = 0x0800
const ZIP_DATA_DESCRIPTOR_FLAG = 0x0008
const ZIP_EOCD_MIN_SIZE = 22
const ZIP_MAX_COMMENT_SIZE = 0xffff
const ZIP_LOCAL_HEADER_SIZE = 30
const ZIP_CENTRAL_HEADER_SIZE = 46
const ZIP_EOCD_SIZE = 22
const ZIP_FIRST_DISK_NUMBER_OFFSET = 4
const ZIP_CENTRAL_DIRECTORY_DISK_OFFSET = 6
const ZIP_DISK_ENTRY_COUNT_OFFSET = 8
const ZIP_TOTAL_ENTRY_COUNT_OFFSET = 10
const ZIP_COMMENT_LENGTH_OFFSET = 20
const textDecoder = new TextDecoder('utf-8', { fatal: true })
const textEncoder = new TextEncoder()

function readUInt16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readUInt32LE(bytes, offset) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0
}

function writeUInt16LE(bytes, offset, value) {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
}

function writeUInt32LE(bytes, offset, value) {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
  bytes[offset + 2] = (value >> 16) & 0xff
  bytes[offset + 3] = (value >> 24) & 0xff
}

function hasNonAsciiByte(bytes) {
  return bytes.some(byte => byte > 0x7f)
}

function isValidUtf8(bytes) {
  try {
    textDecoder.decode(bytes)
    return true
  } catch {
    return false
  }
}

function decodeUtf8(bytes) {
  return textDecoder.decode(bytes)
}

function isMacosxMetadataEntry(fileName) {
  const fileNameParts = fileName.split('/')
  const baseName = fileNameParts[fileNameParts.length - 1]
  return fileName === '__MACOSX' ||
    fileName === '__MACOSX/' ||
    fileName.startsWith('__MACOSX/') ||
    baseName.startsWith('._')
}

function findEndOfCentralDirectory(bytes) {
  const minOffset = Math.max(0, bytes.length - ZIP_EOCD_MIN_SIZE - ZIP_MAX_COMMENT_SIZE)
  for (let offset = bytes.length - ZIP_EOCD_MIN_SIZE; offset >= minOffset; offset -= 1) {
    if (readUInt32LE(bytes, offset) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset
    }
  }
  return -1
}

function isSupportedEndOfCentralDirectory(bytes, eocdOffset) {
  const firstDiskNumber = readUInt16LE(bytes, eocdOffset + ZIP_FIRST_DISK_NUMBER_OFFSET)
  const centralDirectoryDisk = readUInt16LE(bytes, eocdOffset + ZIP_CENTRAL_DIRECTORY_DISK_OFFSET)
  const diskEntryCount = readUInt16LE(bytes, eocdOffset + ZIP_DISK_ENTRY_COUNT_OFFSET)
  const totalEntryCount = readUInt16LE(bytes, eocdOffset + ZIP_TOTAL_ENTRY_COUNT_OFFSET)
  const commentLength = readUInt16LE(bytes, eocdOffset + ZIP_COMMENT_LENGTH_OFFSET)

  return firstDiskNumber === 0 &&
    centralDirectoryDisk === 0 &&
    diskEntryCount === totalEntryCount &&
    commentLength === 0 &&
    eocdOffset + ZIP_EOCD_SIZE === bytes.length
}

function concatParts(parts, totalSize) {
  const output = new Uint8Array(totalSize)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function buildLocalHeader(entry, localOffset) {
  const header = new Uint8Array(ZIP_LOCAL_HEADER_SIZE + entry.fileNameBytes.length + entry.localExtra.length)
  writeUInt32LE(header, 0, ZIP_LOCAL_HEADER_SIGNATURE)
  header.set(entry.localHeader.subarray(4, ZIP_LOCAL_HEADER_SIZE), 4)
  writeUInt16LE(header, 6, entry.flags)
  writeUInt32LE(header, 14, entry.crc)
  writeUInt32LE(header, 18, entry.compressedSize)
  writeUInt32LE(header, 22, entry.uncompressedSize)
  writeUInt16LE(header, 26, entry.fileNameBytes.length)
  writeUInt16LE(header, 28, entry.localExtra.length)
  header.set(entry.fileNameBytes, ZIP_LOCAL_HEADER_SIZE)
  header.set(entry.localExtra, ZIP_LOCAL_HEADER_SIZE + entry.fileNameBytes.length)
  entry.newLocalOffset = localOffset
  return header
}

function buildCentralHeader(entry) {
  const header = new Uint8Array(
    ZIP_CENTRAL_HEADER_SIZE + entry.fileNameBytes.length + entry.centralExtra.length + entry.comment.length
  )
  writeUInt32LE(header, 0, ZIP_CENTRAL_HEADER_SIGNATURE)
  header.set(entry.centralHeader.subarray(4, ZIP_CENTRAL_HEADER_SIZE), 4)
  writeUInt16LE(header, 8, entry.flags)
  writeUInt32LE(header, 16, entry.crc)
  writeUInt32LE(header, 20, entry.compressedSize)
  writeUInt32LE(header, 24, entry.uncompressedSize)
  writeUInt16LE(header, 28, entry.fileNameBytes.length)
  writeUInt16LE(header, 30, entry.centralExtra.length)
  writeUInt16LE(header, 32, entry.comment.length)
  writeUInt32LE(header, 42, entry.newLocalOffset)
  header.set(entry.fileNameBytes, ZIP_CENTRAL_HEADER_SIZE)
  header.set(entry.centralExtra, ZIP_CENTRAL_HEADER_SIZE + entry.fileNameBytes.length)
  header.set(entry.comment, ZIP_CENTRAL_HEADER_SIZE + entry.fileNameBytes.length + entry.centralExtra.length)
  return header
}

function buildEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const eocd = new Uint8Array(ZIP_EOCD_SIZE)
  writeUInt32LE(eocd, 0, ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE)
  writeUInt16LE(eocd, 8, entryCount)
  writeUInt16LE(eocd, 10, entryCount)
  writeUInt32LE(eocd, 12, centralDirectorySize)
  writeUInt32LE(eocd, 16, centralDirectoryOffset)
  return eocd
}

function readEntries(source, centralDirectoryOffset, centralDirectoryEnd) {
  const entries = []
  const normalizedFileNames = new Set()
  let originalEntryCount = 0
  let offset = centralDirectoryOffset

  while (offset < centralDirectoryEnd) {
    originalEntryCount += 1
    if (readUInt32LE(source, offset) !== ZIP_CENTRAL_HEADER_SIGNATURE) {
      return null
    }

    const flags = readUInt16LE(source, offset + 8)
    const compressedSize = readUInt32LE(source, offset + 20)
    const uncompressedSize = readUInt32LE(source, offset + 24)
    const fileNameLength = readUInt16LE(source, offset + 28)
    const centralExtraLength = readUInt16LE(source, offset + 30)
    const commentLength = readUInt16LE(source, offset + 32)
    const localHeaderOffset = readUInt32LE(source, offset + 42)
    const fileNameStart = offset + ZIP_CENTRAL_HEADER_SIZE
    const fileNameEnd = fileNameStart + fileNameLength
    const centralExtraEnd = fileNameEnd + centralExtraLength
    const commentEnd = centralExtraEnd + commentLength

    if (commentEnd > centralDirectoryEnd || localHeaderOffset + ZIP_LOCAL_HEADER_SIZE > source.length) {
      return null
    }

    if (
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      localHeaderOffset === 0xffffffff ||
      readUInt32LE(source, localHeaderOffset) !== ZIP_LOCAL_HEADER_SIGNATURE
    ) {
      return null
    }

    const localNameLength = readUInt16LE(source, localHeaderOffset + 26)
    const localExtraLength = readUInt16LE(source, localHeaderOffset + 28)
    const dataStart = localHeaderOffset + ZIP_LOCAL_HEADER_SIZE + localNameLength + localExtraLength
    const dataEnd = dataStart + compressedSize
    if (dataEnd > source.length) {
      return null
    }

    const fileNameBytes = source.subarray(fileNameStart, fileNameEnd)
    const hasNonAsciiFileName = hasNonAsciiByte(fileNameBytes)
    if (hasNonAsciiFileName && !isValidUtf8(fileNameBytes)) {
      return null
    }

    const fileName = hasNonAsciiFileName
      ? decodeUtf8(fileNameBytes)
      : decodeUtf8(fileNameBytes)
    const normalizedFileName = fileName.normalize('NFC')
    const normalizedFileNameBytes = textEncoder.encode(normalizedFileName)

    if (!isMacosxMetadataEntry(normalizedFileName)) {
      if (normalizedFileNames.has(normalizedFileName)) {
        return null
      }
      normalizedFileNames.add(normalizedFileName)

      entries.push({
        centralHeader: source.subarray(offset, offset + ZIP_CENTRAL_HEADER_SIZE),
        localHeader: source.subarray(localHeaderOffset, localHeaderOffset + ZIP_LOCAL_HEADER_SIZE),
        centralExtra: source.subarray(fileNameEnd, centralExtraEnd),
        localExtra: source.subarray(localHeaderOffset + ZIP_LOCAL_HEADER_SIZE + localNameLength, dataStart),
        comment: source.subarray(centralExtraEnd, commentEnd),
        compressedData: source.subarray(dataStart, dataEnd),
        fileName,
        fileNameBytes: normalizedFileNameBytes,
        flags: (flags | ZIP_UTF8_FILENAME_FLAG) & ~ZIP_DATA_DESCRIPTOR_FLAG,
        crc: readUInt32LE(source, offset + 16),
        compressedSize,
        uncompressedSize,
        changed: normalizedFileName !== fileName || (flags & ZIP_UTF8_FILENAME_FLAG) === 0,
      })
    }

    offset = commentEnd
  }

  return { entries, removedMetadata: entries.length !== originalEntryCount }
}

function rebuildZipWithNormalizedNames(source, centralDirectoryOffset, centralDirectoryEnd) {
  const result = readEntries(source, centralDirectoryOffset, centralDirectoryEnd)
  if (!result) {
    return null
  }

  const { entries, removedMetadata } = result
  if (!entries.length || (!removedMetadata && !entries.some(entry => entry.changed))) {
    return null
  }

  const localParts = []
  let localSize = 0
  for (const entry of entries) {
    const localHeader = buildLocalHeader(entry, localSize)
    localParts.push(localHeader, entry.compressedData)
    localSize += localHeader.length + entry.compressedData.length
  }

  const centralParts = entries.map(entry => buildCentralHeader(entry))
  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const eocd = buildEndOfCentralDirectory(entries.length, centralDirectorySize, localSize)
  return concatParts([...localParts, ...centralParts, eocd], localSize + centralDirectorySize + eocd.length)
}

/**
 * macOS Archive Utility can create ZIP files with UTF-8 Korean filenames but
 * without the ZIP UTF-8 filename flag. Windows Explorer may then show an empty
 * or unusable extracted folder. The payload is already valid; patching the
 * local and central directory flags is enough and avoids recompressing files.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function ensureWindowsCompatibleZipFile(file) {
  if (!file || !String(file.name || '').toLowerCase().endsWith('.zip')) {
    return file
  }

  const source = new Uint8Array(await file.arrayBuffer())
  const eocdOffset = findEndOfCentralDirectory(source)
  if (eocdOffset < 0) {
    return file
  }

  if (!isSupportedEndOfCentralDirectory(source, eocdOffset)) {
    return file
  }

  const centralDirectorySize = readUInt32LE(source, eocdOffset + 12)
  const centralDirectoryOffset = readUInt32LE(source, eocdOffset + 16)
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize
  if (centralDirectoryOffset <= 0 || centralDirectoryEnd > source.length) {
    return file
  }

  const rebuilt = rebuildZipWithNormalizedNames(source, centralDirectoryOffset, centralDirectoryEnd)

  if (!rebuilt) {
    return file
  }

  return new File([rebuilt], file.name, {
    type: file.type || 'application/zip',
    lastModified: file.lastModified ?? Date.now(),
  })
}
