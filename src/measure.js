function SubitoMeasure(contexts) {
  this.contexts = contexts || [];
  this.barline = 'single';

  this.graphical = this.g = {};
  this.g.pen = {x: 0, y: 0};
}

SubitoMeasure.prototype.addContext = function(context) {
  if(!(context instanceof SubitoNote) &&
      !(context instanceof SubitoElement)) {
    throw new Subito.Exception('InvalidContext', 'SubitoMeasure only accepts ' +
        'SubitoNote and SubitoElements as child contexts');
  } else {
    if(context instanceof SubitoNote) {
      context.setMeasure(this);
    }

    this.contexts.push(context);
  }
};

SubitoMeasure.prototype.getMetrics = function() {
  if(this.cachedMetrics) {
    return this.cachedMetrics;
  } else {
    var defaults = SubitoRenderer.DefaultSettings;
    var g = this.graphical || {};
    var width = g.width || defaults.measure.width;
    var height = g.height || defaults.measure.linespan * 4;
    var highest = 0;

    for(var i = 0, length = this.contexts.length; i < length; i++) {
      if(this.contexts[i] instanceof SubitoNote) {
        var metric = this.contexts[i].getMetrics();
        highest = Math.min(highest, metric.position *
            SubitoRenderer.DefaultSettings.measure.linespan -
            SubitoRenderer.DefaultSettings.measure.linespan);
      }
    }

    var metrics = {
      height: height,
      width: width,
      highest: highest
    };

    return (this.cachedMetrics = metrics);
  }
};

SubitoMeasure.prototype.render = function(renderer) {
  var ctx = renderer.context;
  var flags = renderer.flags;
  var metric = this.getMetrics();
  var xshift = this.stave.g.pen.x;
  var yshift = this.stave.g.pen.y;
  var y;

  // Draw stavelines
  for(var i = 0, length = 5; i < length; i++) {
    y = renderer.settings.measure.linespan * i;
    ctx.beginPath();
    ctx.moveTo(xshift, yshift + y);
    ctx.lineTo(xshift + metric.width, yshift + y);
    ctx.closePath();
    ctx.stroke();
  }

  // Draw barline
  if(this.barline == 'single') {
    ctx.beginPath();
    ctx.moveTo(xshift + metric.width + 0.5, yshift);
    ctx.lineTo(xshift + metric.width + 0.5, yshift + y);
    ctx.closePath();
    ctx.stroke();
  } else if(this.barline == 'final') {
    ctx.beginPath();
    ctx.moveTo(xshift + metric.width - 7.5, yshift);
    ctx.lineTo(xshift + metric.width - 7.5, yshift + y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.save();
    ctx.moveTo(xshift + metric.width - 5, yshift);
    ctx.lineTo(xshift + metric.width, yshift);
    ctx.lineTo(xshift + metric.width, yshift + y);
    ctx.lineTo(xshift + metric.width - 5, yshift + y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    throw new Error(this.barline + ' is an unsupported barline');
  }

  // Draw clef
  if(flags.renderClef || this.clef) {
    var clef = this.getClef();
    var clefY = renderer.settings.measure.linespan * clef.line;
    clef.render(renderer, xshift, yshift + clefY);

    xshift += clef.getMetrics(renderer).width;
  } else {
    xshift += 20; // Little margin in measures
  }

  // Draw key
  if(flags.renderKey || this.key) {
    var key = this.getKey();

    key.render(renderer, xshift, yshift);
  }

  // Draw time signature
  if(flags.renderTime || this.time) {
  }

  // Render notes
  var context, shift;
  this.g.pen.x = xshift;
  this.g.pen.y = yshift;
  for(i = 0, length = this.contexts.length; i < length; i++) {
    context = this.contexts[i];
    if(context instanceof SubitoNote) {
      context.render(renderer);
      shift = metric.width/context.tnote.duration;
      this.g.pen.x += shift;
    }
  }
};

SubitoMeasure.prototype.getKey = function() {
  if(this.key instanceof SubitoKey) {
    return this.key;
  } else if(this.stave instanceof SubitoStave) {
    return this.stave.getKey();
  } else {
    return null;
  }
}

SubitoMeasure.prototype.getClef = function() {
  if(this.clef instanceof SubitoClef) {
    return this.clef;
  } else if(this.stave instanceof SubitoStave) {
    return this.stave.getClef();
  } else {
    return null;
  }
};

SubitoMeasure.prototype.setStave = function(stave) {
  this.stave = stave;
};

SubitoMeasure.prototype.setBarline = function(barline) {
  this.barline = barline;
};

SubitoMeasure.DurationUnits = 0x6900; // is divided by 2, 3, 5, and 7

