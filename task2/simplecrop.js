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

  const $body = $('body');
  const $canvas = $('#cropimg');
  const $container = $('.container');
  const cropButton = document.querySelector('button.docrop');
  const cropTargetNE = document.querySelector('.resize.ne');
  const cropTargetSW = document.querySelector('.resize.sw');
  const cropArea = document.querySelector('.croparea');
  const context = $canvas.get(0).getContext('2d');
  const marginLeft = parseInt($container.css('margin-left'), 10) + parseInt($body.css('margin-left'), 10);
  const marginTop = parseInt($container.css('margin-top'), 10);
  const minWidth = 30;
  const minHeight = 30;
  const borderLeft = parseInt($(cropArea).css('border-left-width'), 10);

  // Initial starting value of mouse
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Cropbox coordinates
  let nex = $container.width();
  let ney = 0;
  let swx = 0;
  let swy = $container.height();

  // Controls dragging
  let mousedown = false;

  // Gives coordinates for an image to be contained inside a bounding box and centered
  const containImage = (canvasWidth, canvasHeight, imageAspect) => {
    const imagex = imageAspect * canvasHeight;
    const imagey = canvasWidth / imageAspect;

    const sizex = Math.min(canvasWidth, imagex);
    const sizey = Math.min(canvasHeight, imagey);
    const xpos = (canvasWidth - sizex) / 2;
    const ypos = (canvasHeight - sizey) / 2;

    // final image position and size
    return [xpos, ypos, sizex, sizey];
  };

  // Updates the thumbnail with the new crop dimensions
  const drawThumbnail = (offsetLeft, offsetTop, clientWidth, clientHeight) => {
    const image = new Image();

    image.addEventListener('load', () => {
      const { width, height } = image;
      const hiddenAreaX = (width - $container.width()) / 2;
      const hiddenAreaY = (height - $container.height()) / 2;
      const srcX = offsetLeft + hiddenAreaX;
      const srcY = offsetTop + hiddenAreaY;
      const srcWidth = clientWidth;
      const srcHeight = clientHeight;

      const [destX, destY, destWidth, destHeight] =
        containImage($canvas.width(), $canvas.height(), srcWidth / srcHeight);

      context.clearRect(0, 0, $canvas.width(), $canvas.height());
      context
        .drawImage(image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight);
    });

    image.src = 'mother-elephant-baby-elephant-calf.jpg';
  };


  /**
   * Callback handler for when the crop area is dragged
   * @event {Event} - A mouse event
   **/
  function cropAreaMouseMove(event) {
    if (!mousedown) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { x, y } = event;
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = cropArea;

    const dx = x - startX;
    const dy = y - startY;

    const left = Math.min(Math.max(0, offsetLeft + dx), $container.width() - offsetWidth);
    const top = Math.min(Math.max(0, offsetTop + dy), $container.height() - offsetHeight);

    startX = x;
    startY = y;

    cropArea.style.left = `${left}px`;
    cropArea.style.top = `${top}px`;
  }

  /**
   * Callback handler for when the northeast crop target is dragged
   * @event {Event} - A mouse event
   **/
  function neMouseMove(event) {
    if (!mousedown) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { x, y } = event;
    const { offsetLeft, offsetHeight, offsetTop } = cropArea;

    // Top
    const topLower = (y + offsetY) - marginTop;
    const topUpper = (offsetHeight + offsetTop) - minHeight;
    const top = Math.min(topUpper, Math.max(0, topLower));

    // Height
    const middleY = swy - top;
    const height = (middleY / $container.height()) * 100;

    // Width
    const rightLower = marginLeft + offsetLeft + minWidth;
    const rightUpper = marginLeft + $container.width();
    const rightBoundry = Math.max(rightLower, Math.min(x + offsetX, rightUpper));
    const width = ((rightBoundry - marginLeft - offsetLeft) / $container.width()) * 100;

    startX = x;
    startY = y;

    cropArea.style.width = `${width}%`;
    cropArea.style.height = `${height}%`;
    cropArea.style.top = `${top}px`;
  }

  /**
   * Callback handler for when the southwest crop target is dragged
   * @event {Event} - A mouse event
   **/
  function swMouseMove(event) {
    if (!mousedown) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { x, y } = event;
    const { offsetTop, offsetLeft, offsetWidth } = cropArea;

    // Left
    const leftUpper = (offsetLeft + offsetWidth) - minWidth;
    const leftLower = (x + offsetX) - marginLeft;
    const left = Math.min(Math.max(0, leftLower), leftUpper);

    // Height
    const bottomLower = marginTop + $container.height();
    const bottomUpper = marginTop + offsetTop + minHeight;
    const bottomBoundry = Math.max(bottomUpper, Math.min((y + offsetY), bottomLower));
    const height = ((bottomBoundry - marginTop - offsetTop) / $container.height()) * 100;

    // Width
    const nextWidth = nex - left;
    const width = (nextWidth / $container.width()) * 100;

    cropArea.style.width = `${width}%`;
    cropArea.style.height = `${height}%`;
    cropArea.style.left = `${left}px`;
  }

  /**
   * Callback handler for when the user releases the crop area
   * @event {Event} - A mouse event
   **/
  function cropAreaMouseUp() {
    const {
      offsetLeft, offsetTop, offsetWidth, offsetHeight, clientWidth, clientHeight,
    } = cropArea;

    mousedown = false;
    nex = offsetLeft + offsetWidth;
    ney = offsetTop;
    swx = offsetLeft;
    swy = offsetTop + offsetHeight;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
    document.removeEventListener('mousemove', cropAreaMouseMove);
  }

  /**
   * Callback handler for when the user releases the northeast crop target
   * @event {Event} - A mouse event
   **/
  function neMouseUp() {
    const { offsetLeft, offsetTop, offsetWidth, clientHeight, clientWidth } = cropArea;

    mousedown = false;
    nex = offsetLeft + offsetWidth;
    ney = offsetTop;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
    document.removeEventListener('mousemove', neMouseMove);
  }

  /**
   * Callback handler for when the user releases the southwest crop target
   * @event {Event} - A mouse event
   **/
  function swMouseUp() {
    const { offsetLeft, offsetTop, offsetHeight, clientHeight, clientWidth } = cropArea;

    mousedown = false;
    swx = offsetLeft;
    swy = offsetTop + offsetHeight;

    drawThumbnail(offsetLeft, offsetTop, clientWidth, clientHeight);
    document.removeEventListener('mousemove', swMouseMove);
  }

  /**
   * Callback handler for when the user presses down on the southwest crop target
   * @event {Event} - A mouse event
   **/
  function swMouseDown(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { x, y } = event;
    const { offsetLeft, offsetTop, offsetHeight } = cropArea;

    startX = x;
    startY = y;
    mousedown = true;

    const centerX = offsetLeft + marginLeft + borderLeft;
    const centerY = offsetTop + offsetHeight + marginTop;
    offsetX = centerX - x;
    offsetY = centerY - y;

    document.addEventListener('mousemove', swMouseMove);
    document.addEventListener('mouseup', swMouseUp, { once: true });
  }

  /**
   * Callback handler for when the user presses down on the northeast crop target
   * @event {Event} - A mouse event
   **/
  function neMouseDown(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { x, y } = event;
    const { offsetLeft, offsetTop, offsetWidth } = cropArea;

    startX = x;
    startY = y;
    mousedown = true;

    const centerX = offsetLeft + offsetWidth + marginLeft + borderLeft;
    const centerY = offsetTop + marginTop;
    offsetX = centerX - x;
    offsetY = centerY - y;

    document.addEventListener('mousemove', neMouseMove);
    document.addEventListener('mouseup', neMouseUp, { once: true });
  }

  /**
   * Callback handler for when the user presses down on the croparea
   * @event {Event} - A mouse event
   **/
  function cropAreaMouseDown(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { x, y } = event;

    startX = x;
    startY = y;
    mousedown = true;

    document.addEventListener('mousemove', cropAreaMouseMove);
    document.addEventListener('mouseup', cropAreaMouseUp, { once: true });
  }

  /* *************************************************************************
  * Button to show crop boundaries
  ****************************************************************************/
  cropButton.addEventListener('click', () => {
    alert(`
      Northwest coordinates: ${swx}, ${ney}
      Northeast coordiantes: ${nex}, ${ney}
      Southwest coordiantes: ${swx}, ${swy}
      Southeast coordiantes: ${nex}, ${swy}\n
      Width: ${nex - swx}
      Height: ${swy - ney}
    `);
  });

  /* ***************************************************************************
  * Add mousedown events
  ******************************************************************************/
  cropTargetNE.addEventListener('mousedown', neMouseDown, true);
  cropTargetSW.addEventListener('mousedown', swMouseDown, true);
  cropArea.addEventListener('mousedown', cropAreaMouseDown);
});
