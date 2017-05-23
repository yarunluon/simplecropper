// GOAL:
//
// Fill in the function below in a way that completely satisfies the requirements.
//
//
// Inputs:
//  - canvasWidth, canvasHeight: width and height of canvas (area to be covered)
//    in pixels
//  - imageApsect: aspect ratio of image (width / height)
//
// Output:
//  - Array containing the following:
//    - sizex, sizey: calculated image size in pixels
//    - xpos, ypos: calculated image position offset relative to canvas in
//      pixels
//
// Coordinate system: 0,0 is upper left
//
//
// REQUIREMENTS:
// 1. Size the image to cover the canvas area completely.
// 2. Covering should be minimal - image should be no larger than necessary to
//    cover the canvas area.
// 3. Must maintain original aspect ratio of the image.
// 4. Center the image on the canvas
//
// The function should only return the values specified under Output above.
//


function sizeimage(canvasWidth, canvasHeight, imageAspect) {
  // TODO: fill in here
  const imagex = imageAspect * canvasHeight;
  const imagey = canvasWidth / imageAspect;

  const sizex = Math.max(canvasWidth, imagex);
  const sizey = Math.max(canvasHeight, imagey);
  const xpos = (canvasWidth - sizex) / 2;
  const ypos = (canvasHeight - sizey) / 2;

  // final image position and size
  return [xpos, ypos, sizex, sizey];
}

console.log(sizeimage(50, 200, 1));
console.log(sizeimage(100, 100, 1));
console.log(sizeimage(100, 100, 16 / 9));
console.log(sizeimage(100, 100, 4 / 3));
