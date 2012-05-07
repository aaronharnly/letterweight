function init() {
  letterWeight([
    {font: 'Helvetica', style:'bold'}
    //{font: 'Times New Roman', style:'bold'}
  ]);
}
window.onload = init;
var timeout;

function letterWeight(typefaces) {
  var letters = _.reduce(typefaces, function(memo, typeface) {
    return memo.concat(getLetters(typeface.font, typeface.style));
  }, []);
  var weightedLetters = measureLetterweights(letters);
  var canvas = document.getElementById('letterweight');
  window.addEventListener('resize', function() { resizeCanvas(canvas, weightedLetters) }, false);
  resizeCanvas(canvas, weightedLetters);
}
/* -------------- Data ------------- */
function lettersToRender() {
  var letters = new Array();
  for (var c = "a"; c <= "z"; c = String.fromCharCode(c.charCodeAt(0)+1)) {
    letters.push(c);
    letters.push(c.toUpperCase());
  }
  return letters;
}

var Letter = function(text, font, style) {
  this.text = text;
  this.font = font;
  this.style = style;
  return this;
}

function getLetters(font, style) {
  var style = (typeof style === 'undefined') ? '' : style;
  var chars = lettersToRender();
  var letters = [];
  for (var i=0; i < chars.length; i++) {
    letters.push(new Letter(chars[i], font, style));
  }
  return letters;
}

/* -------------- Rendering --------------- */
function resizeCanvas(canvas, weightedLetters) {
  if (timeout) {
    window.clearTimeout(timeout);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderLetterweights(canvas, canvas.getContext('2d'), weightedLetters);
}
function renderLetterweights(canvas, context, weightedLetters) {
  renderTimestep(canvas, context, weightedLetters, 0, 2000, 5);
}

function renderTimestep(canvas, context, letters, step, totalSteps, delay) {
  clear(canvas, context);
  _.each(letters, function(letter) {
    renderLetterweight(canvas, context, letter, letters, step / totalSteps);
  });
  if (step < totalSteps) {
    timeout = setTimeout(
      renderTimestep,
      delay,
      canvas, context, letters, step+1, totalSteps, delay);
  }
}

function renderLetterweight(canvas, context, letter, letters, t) {
  var scale = (typeof t === "undefined") ? 1.0 : t;
  // position alphabetically, Aa Bb Cc Dd
  var x = (canvas.width * (letter.ordinalAlpha / letters.length));
  var size = canvas.width / letters.length;

  // vertical position by weight and timestep
  var minY = size;
  var maxY = (canvas.height - size);
  var y = minY + (maxY * Math.min(letter.weight, scale));

  // color is by weight and timestep, with a minimum value
  var gray = Math.max(Math.min(letter.weight, scale), 0.05)

  // draw it!
  drawLetter(canvas, context, letter, x, y, size, gray);
}

function drawLetter(canvas, context, letter, x, y, size, gray) {
  context.fillStyle = 'rgba(0,0,0,'+gray+')';
  var sizePx = size + 'px';
  context.font = letter.style + ' ' + sizePx + ' ' + letter.font;
  context.textBaseline = 'bottom';
  context.fillText(letter.text, x, y);
}

/* -------------- Measuring letter weights ----------- */

function measureLetterweights(letters) {
  buffer = createBuffer(400, 400);
  var rawWeights = measureLetterweightsInCanvas(buffer.canvas, buffer.context, letters);
  var annotatedLetters = annotateLetters(letters);
  return annotatedLetters;
}

function createBuffer(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
  return {
    'canvas': canvas,
    'context': context
  };
}

function measureLetterweightsInCanvas(canvas, context, letters) {
  _.each(letters, function(letter) {
    letter.rawWeight = measureLetter(canvas, context, letter);
    clear(canvas, context);
  });
  return letters;
}

function measureLetter(canvas, context, letter) {
    drawLetter(canvas, context, letter, 0, canvas.height, canvas.height, 1);
    return measureBlackness(canvas, context);
}

function clear(canvas, context) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function measureBlackness(canvas, context) {
  var imagedata = context.getImageData(0, 0, canvas.width, canvas.height);
  var pixelCount = imagedata.data.length / 4;
  var totalWeight = 0.0;
  for (var i=0; i < pixelCount; i++) {
    var r = imagedata.data[i * 4 + 0] / 255.0;
    var g = imagedata.data[i * 4 + 1] / 255.0;
    var b = imagedata.data[i * 4 + 2] / 255.0;
    var a = imagedata.data[i * 4 + 3] / 255.0;
    var pixelWeight = a * (((1.0-r)+(1.0-g)+(1.0-b))/3.0);
    totalWeight += pixelWeight;
  }
  var normalizedWeight = totalWeight/pixelCount;
  return normalizedWeight;
}

/* ---------- Weight processing ------- */
function annotateLetters(letters) {
  var scaled = rescaleWeights(letters);
  _.each(scaled, function(x) {
    x.isUpper = x.text.toUpperCase() == x.text;
  });

  // ordinals by weight
  var byWeight = _.sortBy(scaled, function(x) {return x.weight});
  _.each(byWeight, function(x, i) {
    x.ordinalWeight = i;
  });

  // ordinals by letter, Aa Bb Cc
  var byAlpha = _.sortBy(scaled, function(x) {return x.text.toUpperCase() + x.letter});
  _.each(byAlpha, function(x, i) {
    x.ordinalAlpha = i;
  });
  return scaled;
}

function rescaleWeights(weightedLetters) {
  // rescales weights to be relative 0-1
  var rawWeights = _.map(weightedLetters, function(x) {return x.rawWeight});
  var maxWeight = Math.max.apply(Math, rawWeights);
  var minWeight = Math.min.apply(Math, rawWeights);
  var range = maxWeight - minWeight;

  _.each(weightedLetters, function(x) {
    x.weight = (x.rawWeight - minWeight) / range;
  });
  return weightedLetters;
}
