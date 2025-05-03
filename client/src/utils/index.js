const getShortName = (name) =>{
  return name?.split(' ').map(word => word.charAt(0).toUpperCase()).join('')
} 

const checkIfImage = (filePath) => {
  const imageRegex = /\.(jpe?g|png|gif|bmp|tiff?|webp|svg|ico|heic|heif)$/i
  return imageRegex.test(filePath)
}

export {getShortName, checkIfImage}