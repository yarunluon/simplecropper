const sizeimage = (canvasWidth, canvasHeight, imageAspect) => {
  const imagex = imageAspect * canvasHeight;
  const imagey = canvasWidth / imageAspect;

  const sizex = Math.min(canvasWidth, imagex);
  const sizey = Math.min(canvasHeight, imagey);
  const xpos = (canvasWidth - sizex) / 2;
  const ypos = (canvasHeight - sizey) / 2;

  // final image position and size
  return [xpos, ypos, sizex, sizey];
};

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
  const $canvas = $('#cropimg');
  const $container = $('.container');

  const cropTargetNE = document.querySelector('.resize.ne');
  const cropTargetSW = document.querySelector('.resize.sw');
  const cropArea = document.querySelector('.croparea');
  const context = $canvas.get(0).getContext('2d');
  const marginLeft = parseInt($container.css('margin-left'), 10);
  const marginTop = parseInt($container.css('margin-top'), 10);

  const minWidth = 30;
  const minHeight = 30;

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

  function cropAreaMouseMove(event) {
    event.stopPropagation();
    const { x, y, target } = event;
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
  }

  function cropAreaMouseUp(event) {
    console.log('crop area mouseup happened');
    // event.stopPropagation();
    const {
      target: { offsetLeft, offsetTop, offsetWidth, offsetHeight, clientWidth, clientHeight },
    } = event;

    mousedown = false;
    nex = offsetLeft + offsetWidth;
    ney = offsetTop;
    swx = offsetLeft;
    swy = offsetTop + offsetHeight;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
    document.removeEventListener('mousemove', cropAreaMouseMove);
  }

  function neMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();

    const { x, y } = event;
    const { offsetLeft, offsetHeight, offsetTop, offsetWidth } = cropArea;
    console.log('ne', offsetLeft, offsetTop, offsetHeight, offsetWidth);
    console.log(x, y);
    if (!mousedown) {
      return;
    }

    // Top
    const topLower = y - marginTop;
    const topUpper = (offsetHeight + offsetTop) - minHeight;
    const top = Math.min(topUpper, Math.max(0, topLower));

    // Height
    const middleY = swy - top;
    const height = (middleY / $container.height()) * 100;

    // Width
    const rightLower = marginLeft + offsetLeft + minWidth;
    const rightUpper = marginLeft + $container.width();
    const rightBoundry = Math.max(rightLower, Math.min(x, rightUpper));
    const width = ((rightBoundry - marginLeft - offsetLeft) / $container.width()) * 100;

    cropArea.style.width = `${width}%`;
    cropArea.style.height = `${height}%`;
    cropArea.style.top = `${top}px`;
  }

  function swMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();

    const { x, y } = event;
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = cropArea;
    console.log('sw', offsetLeft, offsetTop, offsetHeight, offsetWidth);

    if (!mousedown) {
      return;
    }

    // Left
    const leftUpper = (offsetLeft + offsetWidth) - minWidth;
    const leftLower = x - marginLeft;
    const left = Math.min(Math.max(0, leftLower), leftUpper);

    // Height
    const bottomLower = marginTop + $container.height();
    const bottomUpper = marginTop + offsetTop + minHeight;
    const bottomBoundry = Math.max(bottomUpper, Math.min(y, bottomLower));
    const height = ((bottomBoundry - marginTop - offsetTop) / $container.height()) * 100;

    // Width
    const nextWidth = nex - left;
    const width = (nextWidth / $container.width()) * 100;

    cropArea.style.width = `${width}%`;
    cropArea.style.height = `${height}%`;
    cropArea.style.left = `${left}px`;
  }

  function neMouseUp(event) {
    console.log('ne mouseup happened');

    const { x, y } = event;
    const { offsetLeft, offsetTop, clientHeight, clientWidth } = cropArea;

    mousedown = false;
    nex = x - marginLeft;
    ney = y - marginTop;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);

    document.removeEventListener('mousemove', neMouseMove);
  }

  function swMouseUp(event) {
    console.log('sw mouseup happened');

    const { x, y } = event;
    const { offsetLeft, offsetTop, clientHeight, clientWidth } = cropArea;

    mousedown = false;
    swx = x - marginLeft;
    swy = y - marginTop;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);

    document.removeEventListener('mousemove', swMouseMove);
  }

  function cropAreaMouseDown(event) {
    console.log('crop area mousedown happened');
    // event.stopPropagation();
    const { x, y } = event;
    startX = x;
    startY = y;
    mousedown = true;

    document.addEventListener('mousemove', cropAreaMouseMove);
    document.addEventListener('mouseup', cropAreaMouseUp, { once: true });
  }

  function swMouseDown(event) {
    console.log('sw mousedown happened');

    event.preventDefault();
    event.stopPropagation();
    // cropTargetNE.removeEventListener('mousedown', neMouseDown, true);
    // cropArea.removeEventListener('mousedown', cropAreaMouseDown);
    const { x, y } = event;

    // Update variables used for calculation
    startX = x;
    startY = y;
    mousedown = true;

    console.log('sw', 'startX', startX, 'startY', startY, 'mousedown', mousedown);
    document.addEventListener('mousemove', swMouseMove);
    document.addEventListener('mouseup', swMouseUp, { once: true });
  }

  function neMouseDown(event) {
    console.log('ne mousedown happened');

    event.preventDefault();
    event.stopPropagation();
    // cropTargetSW.removeEventListener('mousedown', swMouseDown, true);
    // cropArea.removeEventListener('mousedown', cropAreaMouseDown);
    const { x, y } = event;

    // Update variables used for calculation
    startX = x;
    startY = y;
    mousedown = true;

    console.log('ne', 'startX', startX, 'startY', startY, 'mousedown', mousedown);
    document.addEventListener('mousemove', neMouseMove);
    document.addEventListener('mouseup', neMouseUp, { once: true });
  }

  /* *********************************************************************
  * Mousemove events
  * @todo: Abstract the events so they can be reused across both targets
  * @todo: Add minimum box size boundaries
  ************************************************************************/


  /* ***************************************************************************
  * Mousedown events
  * @todo: Consider reusing the same callback or a function that generates the same callback
  * @Todo: Consider adding the mousemove event on mousedown
  ******************************************************************************/
  cropTargetNE.addEventListener('mousedown', neMouseDown, true);
  cropTargetSW.addEventListener('mousedown', swMouseDown, true);

  /* ***************************************************************************
  * Mouseup events
  * @todo: Consider reusing the same callback or a function that generates the same callback
  * @Todo: Consider removing the mousemove event on mouseup
  ******************************************************************************/


  /* ************************************************************
  * Events for crop area
  ***************************************************************/

  cropArea.addEventListener('mousedown', cropAreaMouseDown);

  // document.addEventListener('mouseup', () => { mousedown = false; console.log('universal mouseup fired'); });

  // cropArea.addEventListener('mouseup', );

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
