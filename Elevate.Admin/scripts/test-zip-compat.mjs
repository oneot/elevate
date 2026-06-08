import assert from 'node:assert/strict'
import { File } from 'node:buffer'

import { ensureWindowsCompatibleZipFile } from '../src/utils/zipCompat.js'

function writeUInt16LE(buffer, offset, value) {
  buffer[offset] = value & 0xff
  buffer[offset + 1] = (value >> 8) & 0xff
}

function writeUInt32LE(buffer, offset, value) {
  buffer[offset] = value & 0xff
  buffer[offset + 1] = (value >> 8) & 0xff
  buffer[offset + 2] = (value >> 16) & 0xff
  buffer[offset + 3] = (value >> 24) & 0xff
}

function createStoredZipWithMissingUtf8Flag(fileName) {
  const encoder = new TextEncoder()
  const name = encoder.encode(fileName)
  const content = encoder.encode('hello')
  const localSize = 30 + name.length + content.length
  const centralOffset = localSize
  const centralSize = 46 + name.length
  const eocdOffset = centralOffset + centralSize
  const zip = new Uint8Array(eocdOffset + 22)

  writeUInt32LE(zip, 0, 0x04034b50)
  writeUInt16LE(zip, 4, 20)
  writeUInt16LE(zip, 6, 0)
  writeUInt16LE(zip, 8, 0)
  writeUInt32LE(zip, 14, 0x3610a686)
  writeUInt32LE(zip, 18, content.length)
  writeUInt32LE(zip, 22, content.length)
  writeUInt16LE(zip, 26, name.length)
  zip.set(name, 30)
  zip.set(content, 30 + name.length)

  writeUInt32LE(zip, centralOffset, 0x02014b50)
  writeUInt16LE(zip, centralOffset + 4, 20)
  writeUInt16LE(zip, centralOffset + 6, 20)
  writeUInt16LE(zip, centralOffset + 8, 0)
  writeUInt16LE(zip, centralOffset + 10, 0)
  writeUInt32LE(zip, centralOffset + 16, 0x3610a686)
  writeUInt32LE(zip, centralOffset + 20, content.length)
  writeUInt32LE(zip, centralOffset + 24, content.length)
  writeUInt16LE(zip, centralOffset + 28, name.length)
  zip.set(name, centralOffset + 46)

  writeUInt32LE(zip, eocdOffset, 0x06054b50)
  writeUInt16LE(zip, eocdOffset + 8, 1)
  writeUInt16LE(zip, eocdOffset + 10, 1)
  writeUInt32LE(zip, eocdOffset + 12, centralSize)
  writeUInt32LE(zip, eocdOffset + 16, centralOffset)

  return zip
}

function concat(...parts) {
  const totalSize = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(totalSize)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function createZipWithEntries(fileNames) {
  const zips = fileNames.map(fileName => createStoredZipWithMissingUtf8Flag(fileName))
  const localSizes = zips.map(zip => findCentralHeaderOffset(zip))
  const localOffsets = []
  let nextLocalOffset = 0
  for (const localSize of localSizes) {
    localOffsets.push(nextLocalOffset)
    nextLocalOffset += localSize
  }
  const localParts = zips.map((zip, index) => zip.subarray(0, localSizes[index]))
  const centralOffset = localParts.reduce((sum, part) => sum + part.length, 0)
  const centralParts = zips.map((zip, index) => {
    const central = new Uint8Array(zip.subarray(localSizes[index], zip.length - 22))
    writeUInt32LE(central, 42, localOffsets[index])
    return central
  })
  const centralDirectory = concat(...centralParts)
  const eocd = new Uint8Array(22)
  writeUInt32LE(eocd, 0, 0x06054b50)
  writeUInt16LE(eocd, 8, zips.length)
  writeUInt16LE(eocd, 10, zips.length)
  writeUInt32LE(eocd, 12, centralDirectory.length)
  writeUInt32LE(eocd, 16, centralOffset)
  return concat(...localParts, centralDirectory, eocd)
}

function createZipWithMacosxMetadata() {
  return createZipWithEntries([
    'Files/05_사고사례.pdf'.normalize('NFD'),
    '__MACOSX/Files/._05_사고사례.pdf'.normalize('NFD'),
    '__MACOSX',
  ])
}

function createZipWithEocdComment() {
  const zip = createStoredZipWithMissingUtf8Flag('Files/05_사고사례.pdf'.normalize('NFD'))
  const comment = new TextEncoder().encode('comment')
  const output = concat(zip, comment)
  writeUInt16LE(output, zip.length - 2, comment.length)
  return output
}

function createMultiDiskZipMarker() {
  const zip = createStoredZipWithMissingUtf8Flag('Files/05_사고사례.pdf'.normalize('NFD'))
  writeUInt16LE(zip, zip.length - 22 + 4, 1)
  return zip
}

function readUInt16LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8)
}

function readUInt32LE(buffer, offset) {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  ) >>> 0
}

function findCentralHeaderOffset(buffer) {
  for (let offset = 0; offset < buffer.length - 4; offset += 1) {
    if (readUInt32LE(buffer, offset) === 0x02014b50) {
      return offset
    }
  }
  return -1
}

function readFirstCentralFileName(buffer) {
  const offset = findCentralHeaderOffset(buffer)
  assert.notEqual(offset, -1)
  const nameLength = readUInt16LE(buffer, offset + 28)
  return new TextDecoder().decode(buffer.subarray(offset + 46, offset + 46 + nameLength))
}

function readCentralFileNames(buffer) {
  const names = []
  let offset = findCentralHeaderOffset(buffer)
  while (offset > -1 && readUInt32LE(buffer, offset) === 0x02014b50) {
    const nameLength = readUInt16LE(buffer, offset + 28)
    const extraLength = readUInt16LE(buffer, offset + 30)
    const commentLength = readUInt16LE(buffer, offset + 32)
    names.push(new TextDecoder().decode(buffer.subarray(offset + 46, offset + 46 + nameLength)))
    offset += 46 + nameLength + extraLength + commentLength
  }
  return names
}

const incompatibleZip = createStoredZipWithMissingUtf8Flag('Files/05_사고사례.pdf'.normalize('NFD'))
assert.equal(readUInt16LE(incompatibleZip, 6), 0)
assert.equal(readFirstCentralFileName(incompatibleZip), 'Files/05_사고사례.pdf'.normalize('NFD'))
const centralHeaderOffset = findCentralHeaderOffset(incompatibleZip)
assert.notEqual(centralHeaderOffset, -1)

const input = new File([incompatibleZip], 'attach.zip', { type: 'application/zip', lastModified: 0 })
const output = await ensureWindowsCompatibleZipFile(input)
const patched = new Uint8Array(await output.arrayBuffer())
const patchedCentralHeaderOffset = findCentralHeaderOffset(patched)

assert.notEqual(output, input)
assert.equal(output.name, 'attach.zip')
assert.equal(output.type, 'application/zip')
assert.equal(output.lastModified, 0)
assert.equal(readUInt16LE(patched, 6) & 0x0800, 0x0800)
assert.equal(readUInt16LE(patched, patchedCentralHeaderOffset + 8) & 0x0800, 0x0800)
assert.equal(readFirstCentralFileName(patched), 'Files/05_사고사례.pdf')

const macosxZip = createZipWithMacosxMetadata()
const macosxInput = new File([macosxZip], 'attach.zip', { type: 'application/zip' })
const macosxOutput = await ensureWindowsCompatibleZipFile(macosxInput)
const macosxPatched = new Uint8Array(await macosxOutput.arrayBuffer())

assert.deepEqual(readCentralFileNames(macosxPatched), ['Files/05_사고사례.pdf'])

const dotUnderscoreDirectoryZip = createZipWithEntries([
  'Files/._not-metadata/report.pdf'.normalize('NFD'),
])
const dotUnderscoreDirectoryInput = new File([dotUnderscoreDirectoryZip], 'attach.zip', { type: 'application/zip' })
const dotUnderscoreDirectoryOutput = await ensureWindowsCompatibleZipFile(dotUnderscoreDirectoryInput)
const dotUnderscoreDirectoryPatched = new Uint8Array(await dotUnderscoreDirectoryOutput.arrayBuffer())
assert.deepEqual(readCentralFileNames(dotUnderscoreDirectoryPatched), ['Files/._not-metadata/report.pdf'])

const intentionalDotUnderscoreZip = createZipWithEntries(['._custom'])
const intentionalDotUnderscoreInput = new File([intentionalDotUnderscoreZip], 'attach.zip', { type: 'application/zip' })
const intentionalDotUnderscoreOutput = await ensureWindowsCompatibleZipFile(intentionalDotUnderscoreInput)
const intentionalDotUnderscorePatched = new Uint8Array(await intentionalDotUnderscoreOutput.arrayBuffer())
assert.deepEqual(readCentralFileNames(intentionalDotUnderscorePatched), ['._custom'])

const commentedZip = createZipWithEocdComment()
const commentedInput = new File([commentedZip], 'attach.zip', { type: 'application/zip' })
const commentedOutput = await ensureWindowsCompatibleZipFile(commentedInput)
assert.equal(commentedOutput, commentedInput)

const multiDiskZip = createMultiDiskZipMarker()
const multiDiskInput = new File([multiDiskZip], 'attach.zip', { type: 'application/zip' })
const multiDiskOutput = await ensureWindowsCompatibleZipFile(multiDiskInput)
assert.equal(multiDiskOutput, multiDiskInput)

const duplicateNormalizedNameZip = createZipWithEntries([
  'Files/05_사고사례.pdf',
  'Files/05_사고사례.pdf'.normalize('NFD'),
])
const duplicateNormalizedNameInput = new File([duplicateNormalizedNameZip], 'attach.zip', { type: 'application/zip' })
const duplicateNormalizedNameOutput = await ensureWindowsCompatibleZipFile(duplicateNormalizedNameInput)
assert.equal(duplicateNormalizedNameOutput, duplicateNormalizedNameInput)
