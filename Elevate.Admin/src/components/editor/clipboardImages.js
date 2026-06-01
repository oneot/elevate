export function getClipboardImageFiles(clipboardData) {
  if (!clipboardData?.files?.length) return []
  return Array.from(clipboardData.files).filter((file) => file.type.startsWith('image/'))
}

