/**
 * Jakob Miland - 2012
 *  Subito - Music Engraver written in JavaScript
 */

function Subito(canvas) {
  this.score = null;
  this.canvas = canvas;
  
  if(canvas) {
    this.renderer = new SubitoRenderer(canvas);
  }
}

Subito.prototype.parse = function(source, type) {
  if(!source || !type) {
    return false;
  }

  type = Subito.ParserLanguages[type.toLowerCase()];

  if(typeof Subito.Parser[type] === 'function') {
    var parser = new Subito.Parser[type](source);
    try {
      this.score = parser.parseScore();
    } catch(e) {
      return e;
    }

    return true;
  }
  
  return false;
};

// Subito Fonts holds all font objects (Gonville pt.)
Subito.Fonts = {};

// Subito Parsers holds every parser available
Subito.Parsers = {};
Subito.ParserLanguages = {
  'musicjson':      'MusicJSON',
  'musicxml':       'MusicXML',
  'lilypond':       'LilyPond',
  'subito':         'SubitoScript',
  'subitoscript':   'SubitoScript'
};

Subito.Exception = function(code, message) {
  this.code = code || 'SubitoException';
  this.message = String(message) || 'Unknown Subito Exception';
};
Subito.Exception.prototype = Error.prototype;

//=include standalone.js

//=include score.js
//=include renderer.js
//=include backends/svg.js
//=include fonts/gonville.js
//=include parsers/lilypond.js
//=include parsers/musicjson.js
//=include parsers/musicxml.js
//=include parsers/subitoscript.js
