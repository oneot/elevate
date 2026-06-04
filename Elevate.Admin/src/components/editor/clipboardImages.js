export function getClipboardImageFiles(clipboardData) {
  if (!clipboardData?.files?.length) return []
  return Array.from(clipboardData.files).filter((file) => file.type.startsWith('image/'))
}

export function shouldUploadClipboardImages(clipboardData, onUploadImage) {
  return typeof onUploadImage === 'function' && getClipboardImageFiles(clipboardData).length > 0
}
