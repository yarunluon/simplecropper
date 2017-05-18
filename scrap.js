let isDragging = false;

const startDrag = (event) => {
  // console.log($(this));
  // console.log('e', event);
  isDragging = true;
};

const dragging = (event) => {
  const $target = $(event.target);

  if(isDragging) {
    // console.log('dragging');
  } else {
    // console.log('not dragging');
  }
};

const $cropTargetNE = $('.resize.ne')
  .mousedown(startDrag)
  .mousemove(dragging);

const $cropTargetSW = $('.resize.sw')
  .mousedown(startDrag)
  .mousemove(dragging);

console.log($cropTargetSW, $cropTargetNE);
console.log('everything loaded');
