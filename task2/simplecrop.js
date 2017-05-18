// From Task 1
function sizeimage(canvasWidth, canvasHeight, imageAspect) {
    // TODO: fill in here
  const imagex = imageAspect * canvasHeight;
  const imagey = canvasWidth / imageAspect;

  const sizex = Math.min(canvasWidth, imagex);
  const sizey = Math.min(canvasHeight, imagey);
  const xpos = (canvasWidth - sizex) / 2;
  const ypos = (canvasHeight - sizey) / 2;

  // final image position and size
  return [xpos, ypos, sizex, sizey];
}

$(document).ready(() => {
/*  TODO:
*
*
*   PRIMARY REQUIREMENTS
*
*   1.  When the user clicks and drags on either of the resize targets,
*       the crop area should resize in an intuitive way.
*
*   2.  When the user clicks and drags on the crop area but not on the
*       resize targets, the crop area should move in an intuitive way.
*
*   3.  The current crop area should be drawn onto the 100x100 canvas
*       just below the main image. The crop area should be contained inside
*       the canvas area exactly, so that it touches at least two sides of the
*       canvas.
*
*   4.  When the user clicks on the Crop! button, display a browser alert
*       that indicates the boundaries of the crop area, relative to the
*       container div (don't worry about the native size of the image).
*
*   5.  The overall goal is to produce an accurate and quirk-free UI.
*
*   ADDITIONAL INFORMATION
*
*   6.  You don't need to handle touch events.
*
*   7.  You don't need to do anything more style-wise, we are only
*       interested in the functionality for this task.
*
*   8.  You don't need to actually crop the image. Just alerting
*       the boundaries of the crop area is sufficient.
*/

  // jquery elements
  const $button = $('button.docrop');
  const $cropTargetNE = $('.resize.ne');
  const $cropTargetSW = $('.resize.sw');
  const $cropArea = $('.croparea');
  const $canvas = $('#cropimg');
  const $container = $('.container');
  const context = $canvas.get(0).getContext('2d');
  const marginLeft = parseInt($container.css('margin-left'), 10);
  const marginTop = parseInt($container.css('margin-top'), 10);

  // Initial starting value of mouse
  let startX = 0;
  let startY = 0;

  // Cropbox coordinates
  let nex = $container.width();
  let ney = 0;
  let swx = 0;
  let swy = $container.height();

  // Controls dragging
  let mousedown = false;

  const drawThumbnail = (offsetLeft, offsetTop, clientWidth, clientHeight) => {
    const image = new Image();

    image.onload = () => {
      const { width, height } = image;
      const hiddenAreaX = (width - $container.width()) / 2;
      const hiddenAreaY = (height - $container.height()) / 2;
      const srcX = offsetLeft + hiddenAreaX;
      const srcY = offsetTop + hiddenAreaY;
      const srcWidth = clientWidth;
      const srcHeight = clientHeight;

      const [destX, destY, destWidth, destHeight] =
        sizeimage($canvas.width(), $canvas.height(), srcWidth / srcHeight);

      context.clearRect(0, 0, $canvas.width(), $canvas.height());
      context
        .drawImage(image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight);
    };

    image.src = 'mother-elephant-baby-elephant-calf.jpg';
  };

  /* *********************************************************************
  * Mousemove events
  * @todo: Abstract the events so they can be reused across both targets
  * @todo: Add minimum box size boundaries
  ************************************************************************/
  $cropTargetNE.on('mousemove', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y }, target } = event;
    const { parentNode: { offsetLeft } } = target;

    if ((x === 0 && y === 0) || !mousedown) {
      return;
    }

    const top = Math.max(0, y - marginTop);
    const middleY = swy - top;
    const rightBoundry = Math.min(x, marginLeft + $container.width());

    const width = ((rightBoundry - marginLeft - offsetLeft) / $container.width()) * 100;
    const height = (middleY / $container.height()) * 100;

    target.parentNode.style.width = `${width}%`;
    target.parentNode.style.height = `${height}%`;
    target.parentNode.style.top = `${top}px`;
  });

  $cropTargetSW.on('mousemove', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y }, target } = event;
    const { parentNode: { offsetTop } } = target;

    if ((x === 0 && y === 0) || !mousedown) {
      return;
    }

    const left = Math.max(0, x - marginLeft);
    const nextWidth = nex - left;
    const bottomBoundry = Math.min(y, marginTop + $container.height());

    const width = (nextWidth / $container.width()) * 100;
    const height = ((bottomBoundry - marginTop - offsetTop) / $container.height()) * 100;

    target.parentNode.style.width = `${width}%`;
    target.parentNode.style.height = `${height}%`;
    target.parentNode.style.left = `${left}px`;
  });


  /* ***************************************************************************
  * Mousedown events
  * @todo: Consider reusing the same callback or a function that generates the same callback
  * @Todo: Consider adding the mousemove event on mousedown
  ******************************************************************************/
  $cropTargetNE.on('mousedown', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y } } = event;

    // Update variables used for calculation
    startX = x;
    startY = y;
    mousedown = true;
  });

  $cropTargetSW.on('mousedown', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y } } = event;

    // Update variables used for calculation
    startX = x;
    startY = y;
    mousedown = true;
  });

  /* ***************************************************************************
  * Mouseup events
  * @todo: Consider reusing the same callback or a function that generates the same callback
  * @Todo: Consider removing the mousemove event on mouseup
  ******************************************************************************/
  $cropTargetNE.on('mouseup', (event) => {
    event.stopPropagation();

    const { originalEvent: { x, y }, target } = event;
    const { parentNode: { offsetLeft, offsetTop, clientHeight, clientWidth } } = target;

    mousedown = false;
    nex = x - marginLeft;
    ney = y - marginTop;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
  });

  $cropTargetSW.on('mouseup', (event) => {
    event.stopPropagation();

    const { originalEvent: { x, y }, target } = event;
    const { parentNode: { offsetLeft, offsetTop, clientHeight, clientWidth } } = target;

    mousedown = false;
    swx = x - marginLeft;
    swy = y - marginTop;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
  });


  /* ************************************************************
  * Events for crop area
  ***************************************************************/
  $cropArea.on('mousemove', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y }, target } = event;
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = target;

    if ((x === 0 && y === 0) || !mousedown) {
      return;
    }

    const dx = x - startX;
    const dy = y - startY;

    const left = Math.min(Math.max(0, offsetLeft + dx), $container.width() - offsetWidth);
    const top = Math.min(Math.max(0, offsetTop + dy), $container.height() - offsetHeight);

    target.style.left = `${left}px`;
    target.style.top = `${top}px`;

    startX = x;
    startY = y;
  });

  $cropArea.on('mousedown', (event) => {
    event.stopPropagation();
    const { originalEvent: { x, y } } = event;
    startX = x;
    startY = y;
    mousedown = true;
  });

  $cropArea.on('mouseup', (event) => {
    const {
      target: { offsetLeft, offsetTop, offsetWidth, offsetHeight, clientWidth, clientHeight },
    } = event;

    mousedown = false;
    nex = offsetLeft + offsetWidth;
    ney = offsetTop;
    swx = offsetLeft;
    swy = offsetTop + offsetHeight;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
  });

  /* *************************************************************************
  * Button to show crop boundaries
  * @todo: Print an ascii box and show the coordinates around the box corners
  ****************************************************************************/
  $button.on('click', () => {
    alert(`
      North West coordinates: ${swx}, ${ney}\n
      North East coordiantes: ${nex}, ${ney}\n
      South West coordiantes: ${swx}, ${swy}\n
      South East coordiantes: ${nex}, ${swy}\n
      Width: ${nex - swx}\n
      Height: ${swy - ney}
    `);
  });
});
