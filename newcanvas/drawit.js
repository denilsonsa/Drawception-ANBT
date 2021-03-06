// Utilities
function ID(id) {return document.getElementById(id);}
function svgElement(name, attrs)
{
  var el = document.createElementNS("http://www.w3.org/2000/svg", name);
  if (attrs)
  {
    var keys = Object.keys(attrs);
    for (var i = 0; i < keys.length; i++)
    {
      if (attrs[keys[i]] !== null) el.setAttribute(keys[i], attrs[keys[i]]);
    }
  }
  return el;
}
function bytes2string(bytes)
{
  var len = bytes.length;
  var arr = [];
  for (var i = 0; i < len; i++)
  {
    arr.push(String.fromCharCode(bytes[i]));
  }
  return arr.join("");
}
function string2bytes(binary_string)
{
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++)
  {
    var ascii = binary_string.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}
function base642bytes(base64)
{
  return string2bytes(atob(base64));
}
function node2string(node)
{
  if ('outerHTML' in node)
  {
    return node.outerHTML;
  } else {
    var div = document.createElement("div");
    div.appendChild(node.cloneNode(true));
    return div.innerHTML;
  }
}
function unpack_uint16be(s)
{
  return s.charCodeAt(0) << 8 | s.charCodeAt(1);
}
function unpack_int16be(s)
{
  var v = unpack_uint16be(s);
  return v > 32767 ? v - 65536 : v;
}
function int16be(b1, b2)
{
  var v = b1 << 8 | b2;
  return v > 32767 ? v - 65536 : v;
}
function unpack_uint32be(s)
{
  return s.charCodeAt(0) << 24 | s.charCodeAt(1) << 16 | s.charCodeAt(2) << 8 | s.charCodeAt(3);
}
function pack_uint16be(n)
{
  return String.fromCharCode(n >> 8 & 0xff, n & 0xff);
}
function pack_uint32be(n)
{
  return String.fromCharCode(n >> 24 & 0xff, n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff);
}
function color2dword(color)
{
  var r = 0, g = 0, b = 0, a = 255;
  if (color.substr(0, 1) == "#")
  {
    if (color.length == 4)
    {
      r = color.substr(1, 1);
      g = color.substr(2, 1);
      b = color.substr(3, 1);
      r = parseInt(r + r, 16);
      g = parseInt(g + g, 16);
      b = parseInt(b + b, 16);
    } else {
      r = parseInt(color.substr(1, 2), 16);
      g = parseInt(color.substr(3, 2), 16);
      b = parseInt(color.substr(5, 2), 16);
    }
  } else if (color.substr(0, 4) == "rgba")
  {
    var tmp = color.split(/([\d\.]+)/);
    r = parseInt(tmp[1], 10);
    g = parseInt(tmp[3], 10);
    b = parseInt(tmp[5], 10);
    a = Math.floor(parseFloat(tmp[7]) * 255);
  }
  else if (color.substr(0, 3) == "rgb")
  {
    var tmp = color.split(/([\d\.]+)/);
    r = parseInt(tmp[1], 10);
    g = parseInt(tmp[3], 10);
    b = parseInt(tmp[5], 10);
  } else {
    // ?!
  }
  return String.fromCharCode(r, g, b, a);
}
function valueToHex(val)
{
  return (Math.floor(val/16)%16).toString(16)+(Math.floor(val)%16).toString(16);
}
function randomItem(l)
{
  return l[Math.floor(Math.random() * l.length)];
}
function makeCRCTable()
{
  var c;
  var crcTable = [];
  for(var n = 0; n < 256; n++)
  {
    c = n;
    for(var k = 0; k < 8; k++)
    {
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}
function crc32(str, str2)
{
  var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
  var crc = 0 ^ (-1);
  for (var i = 0; i < str.length; i++)
  {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  if (str2)
  {
    for (var i = 0; i < str2.length; i++)
    {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str2.charCodeAt(i)) & 0xFF];
    }
  }
  return (crc ^ (-1)) >>> 0;
}
/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/
// square distance between 2 points
function getSqDist(p1, p2)
{
  var dx = p1.x - p2.x,
      dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}
// square distance from a point to a segment
function getSqSegDist(p, p1, p2)
{
  var x = p1.x,
      y = p1.y,
      dx = p2.x - x,
      dy = p2.y - y;
  if (dx !== 0 || dy !== 0)
  {
    var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
    if (t > 1)
    {
      x = p2.x;
      y = p2.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p.x - x;
  dy = p.y - y;
  return dx * dx + dy * dy;
}
// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(points, sqTolerance)
{
  var len = points.length,
      MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
      markers = new MarkerArray(len),
      first = 0,
      last = len - 1,
      stack = [],
      newPoints = [],
      i, maxSqDist, sqDist, index;
  markers[first] = markers[last] = 1;
  while (last)
  {
    maxSqDist = 0;
    for (i = first + 1; i < last; i++)
    {
      sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist)
      {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (maxSqDist > sqTolerance)
    {
      markers[index] = 1;
      stack.push(first, index, index, last);
    }
    last = stack.pop();
    first = stack.pop();
  }
  for (i = 0; i < len; i++)
  {
    if (markers[i]) newPoints.push(points[i]);
  }
  return newPoints;
}
function buildSmoothPath(points, path)
{
  var dist1, dist2, angle1, angle2, prevtangent, tangent, t1, t2, x, y, p, c, n, l = points.length;
  var good;
  if (l < 2) return;
  path.pathSegList.initialize(path.createSVGPathSegMovetoAbs(points[0].x, points[0].y));
  path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(points[1].x, points[1].y));
  if (l < 3) return;
  for (var i = 1; i < l - 1; i++)
  {
    p = points[i - 1];
    c = points[i];
    n = points[i + 1];
    x = c.x - p.x;
    y = c.y - p.y;
    angle1 = Math.atan2(y, x);
    dist1 = Math.sqrt(x * x + y * y);
    x = n.x - c.x;
    y = n.y - c.y;
    angle2 = Math.atan2(y, x);
    dist2 = Math.sqrt(x * x + y * y);
    tangent = (angle1 + angle2) / 2;
    if (i > 1)
    {
      if (Math.abs(angle2 - angle1) >= Math.PI / 4)
      {
        path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(c.x, c.y));
        good = false;
      } else {
        if (good && dist1 / dist2 >= 0.4 && dist1 / dist2 <= 2.5)
        {
          t1 = {x: p.x + Math.cos(prevtangent) * dist1 * 0.4, y: p.y + Math.sin(prevtangent) * dist1 * 0.4};
          t2 = {x: c.x - Math.cos(tangent) * dist2 * 0.4, y: c.y - Math.sin(tangent) * dist2 * 0.4};
          path.pathSegList.appendItem(path.createSVGPathSegCurvetoCubicAbs(c.x, c.y, t1.x, t1.y, t2.x, t2.y));
        } else {
          path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(c.x, c.y));
          good = true;
        }
      }
    }
    prevtangent = tangent;
  }
  c = points[l - 1];
  path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(c.x, c.y));
}

var random_things = ['hobo', 'shoe', 'log', 'bun', 'sandwich', 'bull', 'beer', 'hair',
  'hill', 'beans', 'man', 'sofa', 'dinosaur', 'road', 'plank', 'hole', 'food',
  'hedgehog', 'pine', 'toad', 'tooth', 'candy', 'rock', 'drop', 'book', 'button', 'carpet',
  'wheel', 'computer', 'box', 'cat', 'rat', 'hook', 'chunk', 'boat', 'spade', 'sack',
  'hammer', 'face', 'soap', 'nose', 'finger', 'steam', 'spring', 'hand', 'fish',
  'elephant', 'dog', 'chair', 'bag', 'phone', 'robot', 'axe', 'grass', 'crack', 'teacher',
  'breadcrumb', 'fridge', 'worm', 'nut', 'cloth', 'apple', 'tongue', 'jar'];
var random_acts = ['crazy from', 'thanks', 'hits', 'lies around on', 'sees', 'grows in',
  'attaches to', 'flies from', 'crawls from', 'chews', 'walks on', 'squishes', 'pecks',
  'wobbles in', 'smokes from', 'smokes', 'rides', 'eats', 'squeals from under',
  'is lost in', 'spins in', 'stuck in', 'hooks', 'angry at', 'bends', 'drips on',
  'rolls on', 'digs', 'crawls in', 'flies at', 'massages', 'dreams of', 'kills', 'pulls',
  "doesn't want", 'licks', 'shoots', 'falls off', 'falls in', 'crawls on', 'turns into',
  'stuck to', 'jumps on', 'hides', 'hides in', 'disassembles', 'rips', 'dissolves',
  'stretches', 'crushes', 'pushes', 'drowns in', 'pokes', 'runs away from', 'wants',
  'scratches', 'throws', 'and'];
var random_descs = ['white', 'concrete', 'shiny', 'ill', 'big', 'ex', 'fast', 'happy',
  'inside-out', 'hot', 'burning', 'thick', 'wooden', 'long', 'good', 'tattered', 'iron',
  'liquid', 'frozen', 'green', 'evil', 'bent', 'rough', 'pretty', 'red', 'round',
  'shaggy', 'bald', 'slow', 'wet', 'wrinkly', 'meaty', 'impudent', 'real', 'distraught',
  'sharp', 'plastic', 'gift', 'squished', 'chubby', 'crumbling', 'horned', 'angry',
  'sitting', 'stranded', 'dry', 'hard', 'thin', 'killer', 'walking', 'cold', 'wheezing',
  'grunting', 'chirping', 'wide', 'electric', 'nuclear'];
function randomPhrase()
{
  function randomBase()
  {
    switch (Math.floor(Math.random() * 3))
    {
      case 0: return [
        randomItem(random_descs),
        randomItem(random_things),
      ].join(' ');
      case 1: return [
        randomItem(random_descs),
        randomItem(random_things),
        randomItem(random_acts),
        randomItem(random_things),
      ].join(' ');
      case 2: return [
        randomItem(random_descs),
        randomItem(random_things),
        randomItem(random_acts),
        randomItem(random_descs),
        randomItem(random_things),
      ].join(' ');
    }
    return "Error!";
  }
  var s = randomBase();
  return s.charAt(0).toUpperCase() + s.substr(1);
}

var palettes = {
  "Normal":          ['#000', '#444', '#999', '#fff', '#603913', '#c69c6d',
                      '#FFDAB9', '#F00', '#FFD700', '#F60', '#16ff00', '#0fad00',
                      '#0FF', '#0247fe', '#ec008c', '#8601af', '#fffdc9'],
  "Sepia":           ['#402305', '#503315', '#604325', '#705335', '#806345', '#907355',
                      '#a08365', '#b09375', '#bfa284', '#cfb294', '#dfc2a4', '#ffe2c4'],
  "Grayscale":       ['#000', '#111', '#222', '#333', '#444', '#555', '#666',
                      '#777', '#888', '#999', '#c0c0c0', '#fff', '#eee' ],
  "Black and white": ['#fff', '#000'],
  "CGA":             ['#555', '#000', '#00A', '#55F', '#0A0', '#5F5', '#0AA', '#5FF',
                      '#A00', '#F55', '#A0A', '#F5F', '#A50', '#FF5', '#AAA', '#FFF'],
  "Gameboy":         ['#8bac0f', '#9bbc0f', '#306230', '#0f380f'],
  "Neon":            ['#fff', '#000', '#adfd09', '#feac09', '#fe0bab', '#ad0bfb', '#00abff'],
  "Thanksgiving":    ['#673718', '#3c2d27', '#c23322', '#850005', '#c67200', '#77785b',
                      '#5e6524', '#cfb178', '#f5e9ce'],
  "Holiday":         ['#3d9949', '#7bbd82', '#7d1a0c', '#bf2a23',
                      '#fdd017', '#00b7f1', '#bababa', '#fff'],
  "Valentine's":     ['#8b2158', '#a81f61', '#bb1364', '#ce0e62', '#e40f64', '#f00',
                      '#f5afc8', '#ffccdf', '#e7e7e7', '#fff'],
  "Halloween":       ['#444', '#000', '#999', '#FFF', '#603913', '#c69c6d',
                      '#7A0E0E', '#B40528', '#FD2119', '#FA5B11', '#FAA611', '#FFD700',
                      '#602749', '#724B97', '#BEF202', '#519548', '#B2BB1E'],
  "the blues":       ['#b6cbe4', '#618abc', '#d0d5ce', '#82a2a1', '#92b8c1', '#607884',
                      '#c19292', '#8c2c2c', '#295c6f'],
  "DawnBringer 16":  ['#140c1c', '#442434', '#30346d', '#4e4a4e', '#854c30', '#346524',
                      '#d04648', '#757161', '#597dce', '#d27d2c', '#8595a1', '#6daa2c',
                      '#d2aa99', '#6dc2ca', '#dad45e', '#deeed6'],
  "March":           ['#9ed396', '#57b947', '#4d7736', '#365431', '#231302',
                      '#3e2409', '#a66621', '#a67e21', '#ebbb49', '#ffc0cb', '#fff']
};

var anbt =
{
  container: null,
  svg: svgElement("svg",
  {
    // Even though Opera complains to have failed to set xmlns attribute:
    // > Failed attribute on svg element: xmlns="http://www.w3.org/2000/svg".
    // this is necessary for loading a saved SVG which otherwise wouldn't
    // bind correct prototypes for functions such as path.pathSegList
    xmlns: "http://www.w3.org/2000/svg",
    version: "1.1",
    width: "600", height: "500",
  }),
  canvas: document.createElement("canvas"),
  svgDisp: svgElement("svg",
  {
    //xmlns: "http://www.w3.org/2000/svg",
    version: "1.1",
    width: "600", height: "500",
    "pointer-events": "none",
  }),
  svgHist: null,
  path: null,
  points: null,
  pngBase64: null,
  lastrect: 0,
  position: 0,
  isStroking: false,
  isPlaying: false,
  size: 14.4,
  smoothening: 1,
  patternCache: {},
  delay: 100,
  unsaved: false,
  background: '#fffdc9',
  transparent: false,
  color: ['#000000', "eraser"],
  fastUndoLevels: 10,
  rewindCache: [],
  BindContainer: function(el)
  {
    this.container = el;
    this.canvas.width = 600;
    this.canvas.height = 500;
    this.canvas.style.background = this.background;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.svgDisp);
    var rect = svgElement("rect",
      {
        "class": "eraser",
        x: 0,
        y: 0,
        width: 600,
        height: 500,
        fill: this.background,
      }
    );
    this.svg.appendChild(rect);
    // This fixes a bug in older Firefox where strokes
    // on transparent background are rendered incorrectly
    this.DrawSVGElement(rect);
  },
  FromOldSVG: function(buf) // TODO: This function is messy
  {
    var arr = [];
    for (var i = 0; i < buf.length; i++)
    {
      arr.push(String.fromCharCode(buf[i]));
    }
    var svgdata = arr.join("");

    var parser = new DOMParser();
    var svg = parser.parseFromString(svgdata, 'text/xml').documentElement;
    for (var i = 0; i < svg.childNodes.length; i++)
    {
      var el = svg.childNodes[i];
      if (el.nodeName == "path")
      {
        el.setAttribute("stroke-linejoin", "round");
        el.setAttribute("stroke-linecap", "round");
        el.setAttribute("fill", "none");
        points = [];
        var x, y;
        for (var j = 0; j < el.pathSegList.numberOfItems; j++)
        {
          var seg = el.pathSegList.getItem(j);
          if (seg.pathSegTypeAsLetter != "l")
          {
            x = seg.x;
            y = seg.y;
            points.push({x: x, y: y});
          } else {
            el.pathSegList.replaceItem(el.createSVGPathSegLinetoAbs(x, y + 0.001), j);
          }
        }
        if (points.length > 2)
        {
          points = simplifyDouglasPeucker(points, this.smoothening);
          buildSmoothPath(points, el);
        }
        el.orig = points;
      }
    }
    this.svg = svg;
    this.lastrect = 0;
    this.rewindCache.length = 0;
    this.position = this.svg.childNodes.length - 1;
    this.UpdateView();
    this.MoveSeekbar(1);
    // Here we assume first element of svg is background rect
    this.SetBackground(this.svg.childNodes[0].getAttribute("fill"));
  },
  PackPlayback: function(svg)
  {
    var arr = [color2dword(this.background)];
    var lastcolor = color2dword("#000000");
    var lastsize = 14.4;
    var lastx = -1, lasty = -1;
    var lastpattern = 0;

    for (var i = 1; i < svg.childNodes.length; i++)
    {
      var el = svg.childNodes[i];
      if (el.nodeName == "path")
      {
        var color = color2dword(el.getAttribute("stroke"));
        if (el.getAttribute("class") == "eraser") color = "\xFF\xFF\xFF\x00";
        var size = el.getAttribute("stroke-width");
        var pattern = el.pattern || 0;
        if (color != lastcolor || size != lastsize)
        {
          arr.push(pack_uint16be(-1));
          arr.push(pack_uint16be(size * 100));
          arr.push(color);
          lastcolor = color;
          lastsize = size;
        }
        if (pattern != lastpattern)
        {
          arr.push(pack_uint16be(-3));
          arr.push(pack_uint16be(pattern));
          arr.push("\x00\x00\x00\x00"); // reserved for the future
          lastpattern = pattern;
        }
        lastx = el.orig[0].x;
        lasty = el.orig[0].y;
        arr.push(pack_uint16be(lastx));
        arr.push(pack_uint16be(lasty));
        for (var j = 1; j < el.orig.length; j++)
        {
          var dx = el.orig[j].x - lastx;
          var dy = el.orig[j].y - lasty;
          // Ignore repeating points
          if (dx === 0 && dy === 0) continue;
          arr.push(pack_uint16be(dx));
          arr.push(pack_uint16be(dy));
          lastx = el.orig[j].x;
          lasty = el.orig[j].y;
        }
        arr.push("\x00\x00\x00\x00");
      } else if (el.nodeName == "rect")
      {
        var color = color2dword(el.getAttribute("fill"));
        arr.push(pack_uint16be(-2));
        arr.push(pack_uint16be(0)); // reserved for the future
        arr.push(color);
      } else {
        throw new Error("Unknown node name: " + el.nodeName);
      }
    }
    var result = "\x04" + bytes2string(pako.deflate(string2bytes(arr.join(""))));
    return result;
  },
  UnpackPlayback: function(bytes)
  {
    var version = bytes[0];
    var start;
    if (version == 4)
    {
      bytes = pako.inflate(bytes.subarray(1));
      start = 0;
    } else if (version == 3)
    {
      bytes = string2bytes(pako.inflate(bytes.subarray(1), {to: "string"}));
      start = 0;
    } else if (version == 2)
    {
      start = 1;
    } else {
      throw new Error("Unsupported version: " + version);
    }
    var svg = svgElement("svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      version: "1.1",
      width: "600", height: "500",
    });
    var color = "#000000";
    var size = 14.4;
    var lastx, lasty, x, y;
    var pattern = 0;
    var points = [];
    // Ignore background alpha
    var background = [
      "rgb(",
      bytes[start],
      ',',
      bytes[start + 1],
      ',',
      bytes[start + 2],
      ')'
    ].join("");
    svg.background = background;

    svg.appendChild(svgElement("rect",
      {
        "class": "eraser",
        x: 0,
        y: 0,
        width: 600,
        height: 500,
        fill: background,
      }
    ));

    for (var i = start + 4; i < bytes.length;)
    {
      x = int16be(bytes[i], bytes[i + 1]);
      i += 2;
      y = int16be(bytes[i], bytes[i + 1]);
      i += 2;
      if (points.length)
      {
        if (x === 0 && y === 0)
        {
          var path = svgElement("path",
            {
              "class": color == "eraser" ? color : null,
              stroke: color == "eraser" ? background : color,
              "stroke-width": size,
              "stroke-linejoin": "round",
              "stroke-linecap": "round",
              fill: "none",
            }
          );
          // Restore blots
          if (points.length === 1)
          {
            path.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(lastx, lasty));
            path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(lastx, lasty + 0.001));
          } else {
            buildSmoothPath(points, path);
          }
          path.orig = points;
          path.pattern = pattern;
          svg.appendChild(path);
          points = [];
        } else {
          x = x + lastx;
          y = y + lasty;
          lastx = x;
          lasty = y;
          points.push({x: x, y: y});
        }
      } else {
        if (x < 0)
        {
          if (x === -1 || x === -2)
          {
            color = [
              "rgba(",
              bytes[i],
              ',',
              bytes[i + 1],
              ',',
              bytes[i + 2],
              ',',
              bytes[i + 3] / 255,
              ')'
            ].join("");
            // TODO: fix ugly code
            if (color == "rgba(255,255,255,0)") color = "eraser";
            i += 4;
            if (x === -1)
            {
              size = y / 100;
            } else {
              svg.appendChild(svgElement("rect",
                {
                  "class": color == "eraser" ? color : null,
                  x: 0,
                  y: 0,
                  width: 600,
                  height: 500,
                  fill: color == "eraser" ? background : color,
                }
              ));
            }
          } else if (x === -3) {
            pattern = y;
            i += 4;
          }
        } else {
          points.push({x: x, y: y});
          lastx = x;
          lasty = y;
        }
      }
    }
    return svg;
  },
  FindLastRect: function(endpos)
  {
    if (!endpos) endpos = this.svg.childNodes.length - 1;
    for (var i = endpos; i > 0; i--)
    {
      var el = this.svg.childNodes[i];
      if (el.nodeName == "rect") return i;
    }
    return 0;
  },
  CutHistoryBeforePosition: function()
  {
    for (var i = this.position - 1; i > 0; i--)
    {
      var el = this.svg.childNodes[i];
      this.svg.removeChild(el);
    }
  },
  CutHistoryBeforeClearAndAfterPosition: function()
  {
    var removing = false;
    for (var i = this.svg.childNodes.length - 1; i > 0; i--)
    {
      var el = this.svg.childNodes[i];
      if (removing || i > this.position)
      {
        this.svg.removeChild(el);
      }
      else if (el.nodeName == "rect" && i <= this.position)
      {
        removing = true;
        // Optimize out two eraser rectangles next to each other
        if (el.getAttribute("class") == "eraser")
        {
          this.svg.removeChild(el);
        }
      }
    }
  },
  MakePNG: function(width, height, fromBuffer)
  {
    // Cut all needless SVG data that comes before clearing whole canvas
    this.CutHistoryBeforeClearAndAfterPosition();
    this.MoveSeekbar(1);

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    if (!this.transparent)
    {
      context.fillStyle = this.background;
      context.fillRect(0, 0, width, height);
    }
    if (fromBuffer)
    {
      context.drawImage(this.canvas, 0, 0, width, height);
    } else {
      context.lineJoin = "round";
      context.lineCap = "round";
      context.scale(width / 600, height / 500);
      for (var i = 0; i < this.svg.childNodes.length; i++)
      {
        this.DrawSVGElement(this.svg.childNodes[i], context);
      }
    }
    this.pngBase64 = canvas.toDataURL("image/png");

    var version = "svGb";
    var svgstr = this.PackPlayback(this.svg);
    var padding = this.pngBase64.substr(-2);
    var prepend, custom, iend;
    // To append the custom chunk, we need to decode the end of the base64-encoded PNG
    // and then reattach as btoa((prepend) + (custom data) + (iend)).
    // As base64 encoding chunks are 3 bytes, iend chunk can start in the middle of those,
    // so (prepend) contains the data before iend chunk that we had to cut.
    if (padding == "==")
    {
      // Two padding characters
      cut = 1;
    } else if (padding[1] == "=")
    {
      // One padding character
      cut = 2;
    } else {
      // No padding
      cut = 3;
    }
    iend = atob(this.pngBase64.substr(-20)).substr(cut);
    prepend = atob(this.pngBase64.substr(-20)).substr(0, cut);
    custom = [
      prepend,
      pack_uint32be(svgstr.length),
      version,
      svgstr,
      pack_uint32be(crc32(version, svgstr)),
      iend
    ].join("");
    this.pngBase64 = this.pngBase64.substr(0, this.pngBase64.length - 20) + btoa(custom);
  },
  FromPNG: function(buffer)
  {
    var dv = new DataView(buffer);
    var magic = dv.getUint32(0);
    if (magic != 0x89504e47) throw new Error("Invalid PNG format: " + pack_uint32be(magic));
    for (var i = 8; i < buffer.byteLength; i += 4 /* Skip CRC */)
    {
      var chunklen = dv.getUint32(i);
      i += 4;
      var chunkname = pack_uint32be(dv.getUint32(i));
      i += 4;
      if (chunkname == "svGb")
      {
        var newsvg = this.UnpackPlayback(new Uint8Array(buffer, i, chunklen));
        this.svg = newsvg;
        // Assume saved data is always optimized and is cut before last rect
        //this.lastrect = this.FindLastRect();
        this.lastrect = 0;
        this.rewindCache.length = 0;
        this.position = this.svg.childNodes.length - 1;
        this.UpdateView();
        this.MoveSeekbar(1);
        // Here we assume first element of svg is background rect
        this.SetBackground(this.svg.background);
        return;
      } else {
        if (chunkname == "IEND") break;
        i += chunklen;
      }
    }
    throw new Error("No vector data found!");
  },
  FromURL: function(url)
  {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    if ('responseType' in xhr)
    {
      xhr.responseType = 'arraybuffer';
    } else {
      alert("Your browser is too old for this");
      return;
    }
    var _anbt = this;
    xhr.onload = function()
    {
      _anbt.FromPNG(this.response);
    };
    xhr.send();
  },
  FromLocalFile: function()
  {
    if (!this.fileInput)
    {
      this.fileInput = document.createElement("input");
      this.fileInput.style.position = "absolute";
      this.fileInput.style.top = "-1000px";
      this.fileInput.type = "file";
      this.fileInput.accept = ".png";
      document.body.appendChild(this.fileInput);
      var _anbt = this;
      this.fileInput.addEventListener("change", function(e)
        {
          var reader = new FileReader();
          reader.onload = function()
          {
            _anbt.FromPNG(this.result);
          };
          if (e.target.files[0])
          {
            reader.readAsArrayBuffer(e.target.files[0]);
          }
        },
        false
      );
    }
    if (!navigator.userAgent.match(/\bPresto\b/))
    {
      var clickEvent = document.createEvent("MouseEvent");
      clickEvent.initMouseEvent("click", true, true, window, 1,
        0, 0, 0, 0, false, false, false, false, 0, null);
      this.fileInput.dispatchEvent(clickEvent);
    } else {
      setTimeout(this.fileInput.click.bind(this.fileInput), 1);
    }
  },
  SetBackground: function(color)
  {
    var transparent = color == "eraser";
    this.transparent = transparent;
    this.canvas.style.background = transparent ? "none" : color;
    color = transparent ? "#fff" : color;
    this.background = color;
    var erased = this.svg.querySelectorAll(".eraser");
    for (var i = 0; i < erased.length; i++)
    {
      if (erased[i].nodeName == "path")
      {
        erased[i].setAttribute("stroke", color);
      } else {
        erased[i].setAttribute("fill", color);
      }
    }
  },
  SetColor: function(num, color)
  {
    this.color[num] = color;
  },
  SetSize: function(size)
  {
    this.size = size;
    this.MoveCursor();
  },
  DrawSVGElement: function(el, ctx)
  {
    if (!ctx) ctx = this.ctx;
    if (el.getAttribute("class") == "eraser")
    {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
    if (el.nodeName == "path")
    {
      var c = el.getAttribute("stroke");
      ctx.strokeStyle = el.pattern ? this.MakePattern(c, el.pattern) : c;
      ctx.lineWidth = el.getAttribute("stroke-width");
      ctx.beginPath();
      for (var i = 0; i < el.pathSegList.numberOfItems; i++)
      {
        var seg = el.pathSegList.getItem(i);
        if (seg.pathSegTypeAsLetter == "M")
        {
          ctx.moveTo(seg.x, seg.y);
        } else if (seg.pathSegTypeAsLetter == "L")
        {
          ctx.lineTo(seg.x, seg.y);
        } else if (seg.pathSegTypeAsLetter == "Q")
        {
          ctx.quadraticCurveTo(seg.x1, seg.y1, seg.x, seg.y);
        } else if (seg.pathSegTypeAsLetter == "C")
        {
          ctx.bezierCurveTo(seg.x1, seg.y1, seg.x2, seg.y2, seg.x, seg.y);
        }
      }
      ctx.stroke();
    }
    else if (el.nodeName == "rect")
    {
      ctx.fillStyle = el.getAttribute("fill");
      var x = el.getAttribute("x");
      var y = el.getAttribute("y");
      var w = el.getAttribute("width");
      var h = el.getAttribute("height");
      ctx.fillRect(x, y, w, h);
    }
  },
  UpdateView: function()
  {
    var start = this.lastrect < this.position ? this.lastrect : 0;
    for (var i = start; i <= this.position; i++)
    {
      this.DrawSVGElement(this.svg.childNodes[i]);
    }
  },
  StrokeBegin: function(x, y, left)
  {
    var cls = null;
    var color = left ? this.color[0] : this.color[1];
    if (color == "eraser")
    {
      color = this.background;
      cls = "eraser";
    }
    this.path = svgElement("path",
      {
        "class": cls,
        stroke: color,
        "stroke-width": this.size,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        fill: "none",
      }
    );
    this.path.pattern = this.pattern;
    this.svgDisp.insertBefore(this.path, this.svgDisp.firstChild);
    this.path.pathSegList.appendItem(this.path.createSVGPathSegMovetoAbs(x, y));
    this.path.pathSegList.appendItem(this.path.createSVGPathSegLinetoAbs(x, y + 0.001));
    this.points = [];
    this.points.push({x: x, y: y});
    this.blot = true;
    this.isStroking = true;
  },
  StrokeEnd: function()
  {
    this.unsaved = true;
    var p = this.points;
    if (p.length > 2)
    {
      p = simplifyDouglasPeucker(p, this.smoothening);
      buildSmoothPath(p, this.path);
    }
    this.path.orig = p;
    this.Add(this.path);
    this.isStroking = false;
  },
  StrokeAdd: function(x, y)
  {
    if (!this.isStroking) throw new Error("StrokeAdd without StrokeBegin!");
    var p = this.points[this.points.length - 1];
    if (p.x == x && p.y == y) return;
    if (this.blot)
    {
      this.path.pathSegList.removeItem(1);
      this.blot = false;
    }
    this.path.pathSegList.appendItem(this.path.createSVGPathSegLinetoAbs(x, y));
    this.points.push({x: x, y: y});
  },
  // Experimental, for making polylines like in Photoshop
  // Caveat: undo will erase whole polyline
  StrokeBeginModifyLast: function(x, y, left)
  {
    if (this.position == 0 || !this.points) return StrokeBegin(x, y, left);
    this.path = this.svg.childNodes[this.position];
    this.points = this.path.orig;
    this.Seek(this.position - 1);
    this.svgDisp.insertBefore(this.path, this.svgDisp.firstChild);
    this.path.pathSegList.appendItem(this.path.createSVGPathSegLinetoAbs(x, y));
    this.points.push({x: x, y: y});
    this.isStroking = true;
  },
  ClearWithColor: function(color)
  {
    this.Add(svgElement("rect",
      {
        "class": color == "eraser" ? color : null,
        x: 0,
        y: 0,
        width: 600,
        height: 500,
        fill: color == "eraser" ? this.background : color,
      }
    ));
    this.lastrect = this.position;
  },
  Add: function(el)
  {
    if (this.rewindCache.length >= this.fastUndoLevels)
    {
      this.rewindCache.pop();
    }
    this.rewindCache.unshift(this.ctx.getImageData(0, 0, 600, 500));

    this.DrawSVGElement(el);
    if (!this.timeedit || this.position == this.svg.childNodes.length - 1)
    {
      // Remove everything past current position
      for (var i = this.svg.childNodes.length - 1; i > this.position; i--)
      {
        this.svg.removeChild(this.svg.childNodes[i]);
      }
      this.svg.appendChild(el);
      this.position = this.svg.childNodes.length - 1;
      this.MoveSeekbar(1);
    } else {
      this.svg.insertBefore(el, this.svg.childNodes[this.position + 1]);
    }
  },
  Undo: function()
  {
    // Prevent "undoing" the background rectangle
    if (this.position > 0)
    {
      this.Seek(this.position - 1);
      this.MoveSeekbar(this.position / (this.svg.childNodes.length - 1));
    }
  },
  Redo: function()
  {
    var posmax = this.svg.childNodes.length - 1;
    if (this.position < posmax)
    {
      this.Seek(this.position + 1);
      this.MoveSeekbar(this.position / posmax);
    }
  },
  MoveSeekbar: function(pos)
  {
    if (this.seekbarMove)
    {
      this.seekbarMove(pos);
    }
  },
  SetSeekbarMove: function(func)
  {
    this.seekbarMove = func;
  },
  GetSeekMax: function()
  {
    return this.svg.childNodes.length - 1;
  },
  Seek: function(newpos)
  {
    var start = -1;
    this.Pause(true);
    if (newpos == this.position) return;
    if (newpos < this.position)
    {
      var rewindSteps = this.position - newpos;
      if (rewindSteps <= this.rewindCache.length)
      {
        // Draw from cached
        this.ctx.putImageData(this.rewindCache[rewindSteps - 1], 0, 0);
        this.rewindCache.splice(0, rewindSteps);
      } else {
        // Not cached; rebuild cache
        start = 0;
        if (this.lastrect <= newpos)
        {
          start = this.lastrect;
        } else {
          start = this.FindLastRect(newpos);
        }
        this.DrawSVGElement(this.svg.childNodes[start]);
      }
    } else if (newpos > this.position) {
      start = this.position;
    }
    if (start != -1)
    {
      var forwardSteps = newpos - start;
      if (forwardSteps >= this.fastUndoLevels)
      {
        this.rewindCache.length = 0;
      } else {
        // Ex: 3 cached, 10 max, 8 steps to play => delete 1 from the end
        var len = this.rewindCache.length;
        var numRemove = Math.min(len, newpos - start + len - this.fastUndoLevels);
        this.rewindCache.splice(len - numRemove, numRemove);
      }
      for (var i = start + 1; i <= newpos; i++)
      {
        if (newpos - i < this.fastUndoLevels)
        {
          this.rewindCache.unshift(this.ctx.getImageData(0, 0, 600, 500));
        }
        this.DrawSVGElement(this.svg.childNodes[i]);
      }
    }
    this.position = newpos;
  },
  Play: function()
  {
    this.rewindCache.length = 0; // TODO: make rewind data remember its position
    if (this.position == this.svg.childNodes.length - 1)
    {
      if (this.position === 0)
      {
        // To make button revert to play
        this.MoveSeekbar(1);
        return;
      }
      this.position = 0;
      this.MoveSeekbar(0);
      // Assume first svg child is background rect
      this.DrawSVGElement(this.svg.childNodes[0]);
    }
    this.isPlaying = true;
    this.playTimer = this.PlayTimer.bind(this);
    this.playTimer();
  },
  PlayTimer: function()
  {
    if (!this.isPlaying) return;
    var posmax = this.svg.childNodes.length - 1;
    var delay = this.delay;
    var maxidx = 0;
    if (this.position < posmax || this.isAnimating)
    {
      if (this.isAnimating)
      {
        maxidx = this.animatePath.pathSegList.numberOfItems - 1;
        if (this.animateIndex < maxidx)
        {
          // There doesn't seem to be a simplier way to copy the pathSeg
          var seg = this.animatePath.pathSegList.getItem(this.animateIndex);
          var newseg;
          if (seg.pathSegTypeAsLetter == "L")
          {
            newseg = this.path.createSVGPathSegLinetoAbs(seg.x, seg.y);
          } else if (seg.pathSegTypeAsLetter == "Q")
          {
            newseg = this.path.createSVGPathSegCurvetoQuadraticAbs(seg.x, seg.y, seg.x1, seg.y1);
          } else if (seg.pathSegTypeAsLetter == "C")
          {
            newseg = this.path.createSVGPathSegCurvetoCubicAbs(seg.x, seg.y, seg.x1, seg.y1, seg.x2, seg.y2);
          }
          this.path.pathSegList.appendItem(newseg);
          this.animateIndex++;
        } else {
          this.isAnimating = false;
          this.svgDisp.removeChild(this.path);
          this.DrawSVGElement(this.animatePath);
          this.position++;
          this.animateIndex = 0;
        }
        delay = this.delay / 6;
      } else {
        var el = this.svg.childNodes[this.position + 1];
        if (el.nodeName == "path")
        {
          this.isAnimating = true;
          this.animatePath = el;
          this.animateIndex = 1;
          this.path = el.cloneNode(true);
          var seg = el.pathSegList.getItem(0);
          this.path.pathSegList.initialize(this.path.createSVGPathSegMovetoAbs(seg.x, seg.y));
          this.svgDisp.insertBefore(this.path, this.svgDisp.firstChild);
        } else {
          this.DrawSVGElement(el);
          this.position++;
        }
      }
    }
    this.MoveSeekbar((this.position + this.animateIndex / maxidx) / posmax);
    if (this.position < posmax)
    {
      setTimeout(this.playTimer, delay);
    } else {
      this.Pause();
    }
  },
  Pause: function(noSeekbar)
  {
    if (this.isPlaying)
    {
      if (this.isAnimating)
      {
        this.isAnimating = false;
        this.svgDisp.removeChild(this.path);
        this.DrawSVGElement(this.animatePath);
        this.position++;
        if (!noSeekbar)
        {
          this.MoveSeekbar(this.position / (this.svg.childNodes.length - 1));
        }
      }
      this.isPlaying = false;
    }
  },
  MoveCursor: function(x, y)
  {
    if (!this.brushCursor)
    {
      this.brushCursor = svgElement("circle",
        {
          "stroke-width": "1",
          stroke: "#000",
          fill: "none",
        }
      );
      this.svgDisp.appendChild(this.brushCursor);
      this.brushCursor2 = svgElement("circle",
        {
          "stroke-width": "1",
          stroke: "#fff",
          fill: "none",
        }
      );
      this.svgDisp.appendChild(this.brushCursor2);
      this.eyedropperCursor = svgElement("image",
        {
          width: 16,
          height: 16,
          visibility: "hidden",
        }
      );
      this.eyedropperCursor.setAttributeNS("http://www.w3.org/1999/xlink", "href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAARklEQVR4XoXRwQoAIAgEUf//pzeGDgq5G3PrCQqVbIAqsDz9WM2qhTX4GZgPV+JpSFxAC0PwbeVZZIpMgXvAMwoj4U9B3wGySxvzk6ZjvwAAAABJRU5ErkJggg==");
      this.svgDisp.appendChild(this.eyedropperCursor);
    }
    // Assume just size change if called with no parameters
    if (typeof x != "undefined")
    {
      this.brushCursor.setAttribute("cx", x);
      this.brushCursor.setAttribute("cy", y);
      this.brushCursor2.setAttribute("cx", x);
      this.brushCursor2.setAttribute("cy", y);
      this.eyedropperCursor.setAttribute("x", x - 1);
      this.eyedropperCursor.setAttribute("y", y - 15);
    }
    this.brushCursor.setAttribute("r", this.size / 2 + 0.5);
    this.brushCursor2.setAttribute("r", this.size / 2 - 0.5);
  },
  ShowEyedropperCursor: function(isEyedropper)
  {
    if (!this.brushCursor) return;
    var vis = isEyedropper ? "hidden" : "visible";
    var vis2 = isEyedropper ? "visible" : "hidden";
    this.brushCursor.setAttribute("visibility", vis);
    this.brushCursor2.setAttribute("visibility", vis);
    this.eyedropperCursor.setAttribute("visibility", vis2);
  },
  Eyedropper: function(x, y)
  {
    var p = this.ctx.getImageData(x, y, 1, 1).data;
    return (p[3] > 0) ? ("#" + valueToHex(p[0]) + valueToHex(p[1]) + valueToHex(p[2])) : this.background;
  },
  RequestSave: function()
  {
    if (!this.pngBase64) return false;
    if (!this.saveLink)
    {
      this.saveLink = document.createElement("a");
      document.body.appendChild(this.saveLink);
    }
    if ("download" in this.saveLink)
    {
      this.saveLink.href = this.pngBase64;
      var d = new Date();
      this.saveLink.download =
      [
        "DrawingInTime_",
        d.getFullYear(),
        "_",
        (101 + d.getMonth() + "").slice(-2),
        (100 + d.getDate() + "").slice(-2),
        "_",
        (100 + d.getHours() + "").slice(-2),
        (100 + d.getMinutes() + "").slice(-2),
        (100 + d.getSeconds() + "").slice(-2),
        ".png"
      ].join("");
      this.saveLink.click();
    } else {
      window.open(this.pngBase64);
    }
    this.unsaved = false;
    return true;
  },
  UploadToImgur: function(callback)
  {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.onload = function()
    {
      var res = xhr.responseText;
      try
      {
        res = JSON.parse(res);
      }
      catch(e) {}
      if (res.success)
      {
        // To set description
        var xhr2 = new XMLHttpRequest();
        xhr2.open("POST", "https://api.imgur.com/3/image/" + res.data.deletehash);
        xhr2.setRequestHeader('Authorization', 'Client-ID 4809db83c8897af');
        var fd = new FormData();
        fd.append("description", "Playback: http://grompe.org.ru/drawit/#" + res.data.id);
        xhr2.send(fd);
      }
      callback(res);
    };
    xhr.onerror = function(e)
    {
      callback("error: " + e);
    };
    xhr.setRequestHeader('Authorization', 'Client-ID 4809db83c8897af');
    var fd = new FormData();
    fd.append("image", new Blob([base642bytes(this.pngBase64.substr(22)).buffer], {type: "image/png"}));
    fd.append("type", "file");
    fd.append("title", "Made with Drawing in Time");
    fd.append("description", "http://grompe.org.ru/drawit/");
    xhr.send(fd);
  },
  FromImgur: function(id)
  {
    // https link to prevent recompression by various optimizing proxies
    this.FromURL("https://i.imgur.com/" + id + ".png");
  },
  MakePattern: function(color, patid)
  {
    if (this.patternCache[color] && this.patternCache[color][patid])
    {
      return this.patternCache[color][patid];
    } else {
      if (!this.patternCache[color])
      {
        this.patternCache[color] = [];
      }
      if (!this.patternCanvas)
      {
        this.patternCanvas = document.createElement("canvas");
        this.patternCanvas.width = 16;
        this.patternCanvas.height = 16;
      }
      var ctx = this.patternCanvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.clearRect(0, 0, 16, 16);
      if (patid == 1)
      {
        ctx.beginPath();
        ctx.arc(2, 2, 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, 6, 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.drawImage(this.patternCanvas, 8, 0);
        ctx.drawImage(this.patternCanvas, 0, 8);
      } else if (patid == 2) {
        ctx.beginPath();
        ctx.arc(2, 2, 1, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, 6, 1, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.drawImage(this.patternCanvas, 8, 0);
        ctx.drawImage(this.patternCanvas, 0, 8);
      } else if (patid == 3) {
        ctx.beginPath();
        ctx.arc(4, 4, 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 12, 2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.drawImage(this.patternCanvas, 8, -4);
        ctx.drawImage(this.patternCanvas, 8, 12);
      } else if (patid == 4) {
        ctx.fillRect(0, 0, 2, 2);
        ctx.fillRect(4, 0, 2, 2);
        ctx.fillRect(0, 4, 2, 2);
        ctx.fillRect(4, 4, 2, 2);
        ctx.drawImage(this.patternCanvas, 8, 0);
        ctx.drawImage(this.patternCanvas, 0, 8);
      } else if (patid == 5) {
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillRect(4, 0, 1, 1);
        ctx.fillRect(0, 4, 1, 1);
        ctx.fillRect(4, 4, 1, 1);
        ctx.drawImage(this.patternCanvas, 8, 0);
        ctx.drawImage(this.patternCanvas, 0, 8);
      }
      var pat = this.ctx.createPattern(this.patternCanvas, 'repeat');
      return (this.patternCache[color][patid] = pat);
    }
  },
  SetPattern: function(patid)
  {
    this.pattern = patid;
  },
};

var timerStart, timerCallback;

function bindEvents()
{
  var wacom = ID("wacom");
  var getPointerType = function()
  {
    return wacom.penAPI && wacom.penAPI.isWacom ? wacom.penAPI.pointerType : 0;
  };

  var checkPlayingAndStop = function()
  {
    if (anbt.isPlaying)
    {
      anbt.Pause();
      ID("play").classList.remove("pause");
      return true;
    }
    return false;
  };
  var rect;
  var mouseMove = function(e)
  {
    e.preventDefault();
    var x = e.pageX - rect.left - pageXOffset;
    var y = e.pageY - rect.top - pageYOffset;
    anbt.StrokeAdd(x, y);
  };
  var mouseUp = function(e)
  {
    if (e.button === 0 || e.button === 2)
    {
      e.preventDefault();
      anbt.StrokeEnd();
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('mousemove', mouseMove);
    }
  };
  ID("svgContainer").addEventListener('mousedown', function(e)
  {
    if (e.button === 0 || e.button === 2)
    {
      if (anbt.isStroking) return mouseUp(e);
      if (checkPlayingAndStop()) return;
      e.preventDefault();
      rect = this.getBoundingClientRect();
      var x = e.pageX - rect.left - pageXOffset;
      var y = e.pageY - rect.top - pageYOffset;

      if (e.altKey)
      {
        anbt.SetColor(e.button === 0 ? 0 : 1, anbt.Eyedropper(x, y));
        updateColorIndicators();
      } else {
        // PointerType == 3 is pen tablet eraser
        var left = e.button === 0 && getPointerType() !== 3;
        if (e.shiftKey)
        {
          anbt.StrokeBeginModifyLast(x, y, left);
        } else {
          anbt.StrokeBegin(x, y, left);
        }
        window.addEventListener('mouseup', mouseUp);
        window.addEventListener('mousemove', mouseMove);
      }
    }
  });
  ID("svgContainer").addEventListener('mousemove', function(e)
  {
    rect = this.getBoundingClientRect();
    var x = e.pageX - rect.left - pageXOffset;
    var y = e.pageY - rect.top - pageYOffset;
    anbt.MoveCursor(x, y);
  });

  var touchSingle = false;
  var lastTouch;
  var simulateSingleTouchStart = function()
  {
    if (touchSingle)
    {
      var x = lastTouch.pageX - rect.left - pageXOffset;
      var y = lastTouch.pageY - rect.top - pageYOffset;
      anbt.StrokeBegin(x, y, true);
      touchSingle = false;
    }
  };
  var touchMove = function(e)
  {
    if (e.touches.length === 1)
    {
      simulateSingleTouchStart();
      e.preventDefault();
      if (anbt.isStroking)
      {
        var x = e.touches[0].pageX - rect.left - pageXOffset;
        var y = e.touches[0].pageY - rect.top - pageYOffset;
        anbt.StrokeAdd(x, y);
      }
    }
  };
  var touchEnd = function(e)
  {
    if (e.touches.length === 0)
    {
      simulateSingleTouchStart();
      e.preventDefault();
      anbt.StrokeEnd();
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('touchmove', touchMove);
    }
  };
  var touchUndoRedo = function(e)
  {
    if (e.changedTouches.length === 1 && e.touches.length === 1)
    {
      var ch = e.changedTouches[0];
      if (Math.abs(ch.pageX - lastTouch.pageX) < 10 &&
          Math.abs(ch.pageY - lastTouch.pageY) < 10)
      {
        ID("play").classList.remove("pause");
        if (ch.pageX < e.touches[0].pageX)
        {
          anbt.Undo();
        } else {
          anbt.Redo();
        }
      }
    }
    window.removeEventListener('touchend', touchUndoRedo);
  };
  ID("svgContainer").addEventListener('touchstart', function(e)
  {
    if (e.touches.length === 1)
    {
      if (checkPlayingAndStop()) return;
      // Let two-finger scrolling, pinching, etc. work.
      // This requires moving dot-drawing to simulateSingleTouchStart()
      rect = this.getBoundingClientRect();
      touchSingle = true;
      lastTouch = e.touches[0];
      window.addEventListener('touchend', touchEnd);
      window.addEventListener('touchmove', touchMove);
    } else {
      // Enable two-finger undo and redo:
      // 1     o    o
      // 2   o o    o o
      // 3   , o    o .
      //     Undo   Redo
      if (touchSingle && e.touches.length === 2)
      {
        lastTouch = e.touches[1];
        window.addEventListener('touchend', touchUndoRedo);
      }
      if (anbt.isStroking)
      {
        anbt.StrokeEnd();
      }
      touchSingle = false;
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('touchmove', touchMove);
    }
  });

  ID("svgContainer").addEventListener('mouseleave', function(e)
  {
    // Hide brush cursor
    anbt.MoveCursor(-100, -100);
  });
  ID("svgContainer").addEventListener('contextmenu', function(e)
  {
    e.preventDefault();
  });

  ID("import").addEventListener('click', function(e)
  {
    e.preventDefault();
    ID("svgContainer").classList.add("loading");
    anbt.FromLocalFile();
    ID("svgContainer").classList.remove("loading");
  });
  var warnStrokesAfterPos = function()
  {
    return (anbt.position < anbt.GetSeekMax() && !confirm("Strokes after current position will be discarded. Continue?"));
  };
  var doExport = function(e)
  {
    e.preventDefault();
    if (warnStrokesAfterPos()) return;
    anbt.MakePNG(600, 500, true);
    anbt.RequestSave();
  };
  ID("export").addEventListener('click', doExport);
  ID("imgur").addEventListener('click', function(e)
  {
    e.preventDefault();
    if (warnStrokesAfterPos()) return;
    ID("imgur").childNodes[0].nodeValue = "Uploading...";
    ID("imgur").disabled = true;
    anbt.MakePNG(600, 500, true);
    anbt.UploadToImgur(function(r)
    {
      ID("imgur").childNodes[0].nodeValue = "Upload to imgur";
      ID("popup").classList.add("show");
      ID("popuptitle").childNodes[0].nodeValue = "Imgur upload result";
      if (r && r.success)
      {
        anbt.unsaved = false;
        history.replaceState(null, null, "#" + r.data.id);
        ID("imgururl").href = "http://imgur.com/" + r.data.id;
        ID("imgururl").childNodes[0].nodeValue = "Uploaded image";
        ID("imgurdelete").href = "http://imgur.com/delete/" + r.data.deletehash;
        ID("imgurerror").childNodes[0].nodeValue = "";
      } else {
        var err = r.data ? ("Imgur error: " + r.data.error) : ("Error: " + r);
        ID("imgurerror").childNodes[0].nodeValue = err;
      }
      ID("imgur").disabled = false;
    });
  });
  window.addEventListener('keydown', function(e)
  {
  });
  function makeBrushFunc(size)
  {
    var s = size;
    return function(e)
    {
      e.preventDefault();
      anbt.SetSize(s);
      var el = ID("tools").querySelector(".sel");
      if (el) el.classList.remove("sel");
      this.classList.add("sel");
    };
  }
  var brushSizes = [2.4, 6, 14.4, 42];

  for (var i = 0; i < brushSizes.length; i++)
  {
    ID("brush" + i).addEventListener('click', makeBrushFunc(brushSizes[i]), false);
  }
  var updateColorIndicators = function()
  {
    var c0 = anbt.color[0];
    var c1 = anbt.color[1];
    if (c0 == 'eraser')
    {
      ID("primary").style.backgroundColor = 'pink';
      ID("primary").classList.add('eraser');
    } else {
      ID("primary").style.backgroundColor = c0;
      ID("primary").classList.remove('eraser');
    }
    if (c1 == 'eraser')
    {
      ID("secondary").style.backgroundColor = 'pink';
      ID("secondary").classList.add('eraser');
    } else {
      ID("secondary").style.backgroundColor = c1;
      ID("secondary").classList.remove('eraser');
    }
  };
  var chooseBackground = false;
  var colorClick = function(e)
  {
    if (e.touches || e.button === 0 || e.button === 2)
    {
      e.preventDefault();
      var color = this.style.backgroundColor;
      if (chooseBackground)
      {
        if (this.id != "eraser")
        {
          anbt.SetBackground(color);
        }
        chooseBackground = false;
        ID("colors").classList.remove("setbackground");
        ID("setbackground").classList.remove("sel");
      } else {
        var showcolor = color;
        if (this.id == "eraser")
        {
          color = "eraser";
          showcolor = "pink";
        }
        // PointerType == 3 is pen tablet eraser
        if (e.button === 2 || getPointerType() === 3)
        {
          anbt.SetColor(1, color);
        } else {
          anbt.SetColor(0, color);
        }
        updateColorIndicators();
      }
    }
  };
  var noDefault = function(e)
  {
    e.preventDefault();
  };
  var els = ID("colors").querySelectorAll("b");
  for (var i = 0; i < els.length; i++)
  {
    els[i].addEventListener('mousedown', colorClick);
    els[i].addEventListener('touchend', colorClick);
    els[i].addEventListener('contextmenu', noDefault);
  }
  ID("setbackground").addEventListener('click', function(e)
  {
    e.preventDefault();
    chooseBackground = true;
    ID("colors").classList.add("setbackground");
    ID("setbackground").classList.add("sel");
  });
  ID("undo").addEventListener('click', function(e)
  {
    e.preventDefault();
    ID("play").classList.remove("pause");
    anbt.Undo();
  });
  ID("redo").addEventListener('click', function(e)
  {
    e.preventDefault();
    ID("play").classList.remove("pause");
    anbt.Redo();
  });
  ID("trash").addEventListener('click', function(e)
  {
    e.preventDefault();
    anbt.ClearWithColor("eraser");
    if (ID("newcanvasyo").classList.contains("sandbox"))
    {
      timerStart = Date.now();
    }
  });

  var knobMove = function(fraction)
  {
    var x = Math.floor(fraction * 502 - 10);
    if (fraction > 0)
    {
      ID("knob").classList.add("smooth");
    } else {
      ID("knob").classList.remove("smooth");
    }
    ID("knob").style.marginLeft = x + 'px';
    if (fraction >= 1)
    {
      ID("play").classList.remove("pause");
    }
  };
  anbt.SetSeekbarMove(knobMove);
  var knobCommonMove = function(e)
  {
    e.preventDefault();
    var len = anbt.GetSeekMax();
    var x = (e.touches ? e.touches[0].pageX : e.pageX) - rect.left - pageXOffset - 34;
    x = Math.min(Math.max(-10, x), 492);
    var pos = Math.round((x + 10) / 502 * len);
    x = pos / len * 502 - 10;
    ID("knob").classList.add("smooth");
    ID("knob").style.marginLeft = x + 'px';
    anbt.Seek(pos);
    ID("play").classList.remove("pause");
  };
  var knobCommonUp = function(e)
  {
    if (e.button === 0 || e.touches && e.touches.length === 0)
    {
      e.preventDefault();
      window.removeEventListener('mouseup', knobCommonUp);
      window.removeEventListener('touchend', knobCommonUp);
      window.removeEventListener('mousemove', knobCommonMove);
      window.removeEventListener('touchmove', knobCommonMove);
    }
  };
  var knobCommonDown = function(e)
  {
    if (e.button === 0 || e.touches && e.touches.length === 1)
    {
      rect = ID("seekbar").getBoundingClientRect();
      knobCommonMove(e);
      window.addEventListener('mouseup', knobCommonUp);
      window.addEventListener('touchend', knobCommonUp);
      window.addEventListener('mousemove', knobCommonMove);
      window.addEventListener('touchmove', knobCommonMove);
    }
  };
  ID("knob").addEventListener('mousedown', knobCommonDown);
  ID("knob").addEventListener('touchstart', knobCommonDown);
  ID("seekbar").addEventListener('mousedown', knobCommonDown);
  ID("seekbar").addEventListener('touchstart', knobCommonDown);

  var playCommonDown = function(e)
  {
    e.stopPropagation();
    e.preventDefault();
    if (anbt.isPlaying)
    {
      ID("play").classList.remove("pause");
      anbt.Pause();
    } else {
      ID("play").classList.add("pause");
      anbt.Play();
    }
  };
  ID("play").addEventListener('mousedown', playCommonDown);
  ID("play").addEventListener('touchstart', playCommonDown);

  var choosePalette = function(e)
  {
    if (e.touches || e.button === 0)
    {
      e.preventDefault();
      var name = this.childNodes[0].nodeValue;
      ID("palettename").childNodes[0].nodeValue = name;
      var colors = palettes[name];
      var pal = ID("palette");
      var els = pal.querySelectorAll("b");
      // Remove all current colors except for the eraser
      for (var i = 0; i < els.length - 1; i++)
      {
        pal.removeChild(els[i]);
      }
      var eraser = els[els.length - 1];
      for (var i = 0; i < colors.length; i++)
      {
        var b = document.createElement("b");
        b.style.backgroundColor = colors[i];
        b.addEventListener('mousedown', colorClick);
        b.addEventListener('touchend', colorClick);
        b.addEventListener('contextmenu', noDefault);
        pal.appendChild(b);
        // Eraser got on the front, put it on the back
        pal.appendChild(eraser);
      }
    }
  };
  var closePaletteList = function(e)
  {
    if (e.touches || e.button === 0)
    {
      ID("palettechooser").classList.remove("open");
      window.removeEventListener('mousedown', closePaletteList);
      window.removeEventListener('touchend', closePaletteList);
    }
  };
  var openPaletteList = function(e)
  {
    if (e.touches || e.button === 0)
    {
      e.preventDefault();
      var chooser = ID("palettechooser");
      chooser.classList.toggle("open");
      if (chooser.classList.contains("open"))
      {
        setTimeout(function()
        {
          window.addEventListener('mousedown', closePaletteList);
          window.addEventListener('touchend', closePaletteList);
        }, 1);
      }
      var keys = Object.keys(palettes);
      if (chooser.childNodes.length < keys.length)
      {
        var canvas = document.createElement("canvas");
        canvas.height = 10;
        var ctx = canvas.getContext("2d");
        for (var i = chooser.childNodes.length; i < keys.length; i++)
        {
          canvas.width = 8 * palettes[keys[i]].length + 2;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 0.5;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
          for (var j = 0; j < palettes[keys[i]].length; j++)
          {
            ctx.fillStyle = palettes[keys[i]][j];
            ctx.fillRect(j * 8 + 1, 1, 8, 8);
          }
          var div = document.createElement("div");
          div.appendChild(document.createTextNode(keys[i]));
          div.style.backgroundImage = 'url("' + canvas.toDataURL() + '")';
          div.style.backgroundRepeat = 'no-repeat';
          div.style.backgroundPosition = 'center 35px';
          div.addEventListener('mousedown', choosePalette);
          div.addEventListener('touchend', choosePalette);
          chooser.appendChild(div);
        }
      }
    }
  };
  ID("palettename").addEventListener('mousedown', openPaletteList);
  ID("palettename").addEventListener('touchend', openPaletteList);

  // TODO: refactor: generalize with palette chooser menu
  var closeMenu = function(e)
  {
    if (e.touches || e.button === 0)
    {
      ID("menu").classList.remove("open");
      window.removeEventListener('mousedown', closeMenu);
      window.removeEventListener('touchend', closeMenu);
    }
  };
  var openMenu = function(e)
  {
    if (e.touches || e.button === 0)
    {
      e.preventDefault();
      var menu = ID("menu");
      menu.classList.toggle("open");
      if (menu.classList.contains("open"))
      {
        setTimeout(function()
        {
          window.addEventListener('mousedown', closeMenu);
          window.addEventListener('touchend', closeMenu);
        }, 1);
      }

    }
  };
  ID("openmenu").addEventListener('mousedown', openMenu);
  ID("openmenu").addEventListener('touchend', openMenu);

  var exitPlay = function(e)
  {
    e.preventDefault();
    ID("newcanvasyo").classList.add("sandbox");
    ID("newcanvasyo").classList.remove("play");
    timerStart -= 10*60*1000;
    timerCallback = null;
  };
  ID("exit").addEventListener('click', exitPlay);
  ID("submit").addEventListener('click', exitPlay);

  // Menu items
  var simulatePlay = function(e)
  {
    e.preventDefault();
    ID("newcanvasyo").classList.remove("sandbox");
    ID("newcanvasyo").classList.add("play");
    timerStart = Date.now() + 10*60*1000;
    timerCallback = function(s)
    {
      if (s < 0) exitPlay(e);
    };
    ID("drawthis").childNodes[0].nodeValue = randomPhrase();
  };
  ID("simplay").addEventListener('mousedown', simulatePlay);
  ID("simplay").addEventListener('touchend', simulatePlay);
  ID("skip").addEventListener('click', simulatePlay);

  var exportCustomPNG = function(e)
  {
    e.preventDefault();
    if (warnStrokesAfterPos()) return;
    var m = prompt("PNG size to export? Enter only width to maintain aspect ratio.", "600x500");
    if (!m) return;
    m = m.match(/(\d+)/g);
    if (!m)
    {
      alert("Invalid size.");
      return;
    }
    var width = m[0];
    var height = m[1] || Math.round(width / 1.2);
    anbt.MakePNG(width, height);
    anbt.RequestSave();
  };
  ID("custompng").addEventListener('mousedown', exportCustomPNG);
  ID("custompng").addEventListener('touchend', exportCustomPNG);

  var setTransparentBackground = function(e)
  {
    e.preventDefault();
    anbt.SetBackground("eraser");
  };
  ID("transparentbg").addEventListener('mousedown', setTransparentBackground);
  ID("transparentbg").addEventListener('touchend', setTransparentBackground);

  var enablePatterns = function(e)
  {
    e.preventDefault();
    ID("enablepatterns").childNodes[0].nodeValue = "(patterns are enabled)"
    ID("enablepatterns").removeEventListener('mousedown', enablePatterns);
    ID("enablepatterns").removeEventListener('touchend', enablePatterns);
    var div = document.createElement('div');
    div.className = "panel";
    div.appendChild(document.createTextNode("pattern:"));

    var canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    var ctx = canvas.getContext("2d");
    var makePatternPreview = function(pattern)
    {
      ctx.clearRect(0, 0, 48, 48);
      ctx.fillStyle = anbt.MakePattern("#000", pattern);
      ctx.fillRect(0, 0, 48, 48);
      return canvas.toDataURL();
    };
    var makePatternClick = function(pattern)
    {
      return function() { anbt.SetPattern(pattern); }
    };
    for (var i = 0; i < 6; i++)
    {
      var button = document.createElement('button');
      button.style.width = "55px";
      button.style.height = "44px";
      button.style.margin = "0 2px";
      button.style.verticalAlign = "top";
      if (i === 0) button.appendChild(document.createTextNode("(none)"));
      if (i > 0) button.style.backgroundImage = 'url("' + makePatternPreview(i) + '")';
      button.addEventListener('click', makePatternClick(i));
      div.appendChild(button);
    }
    ID("newcanvasyo").appendChild(div);
  };
  ID("enablepatterns").addEventListener('mousedown', enablePatterns);
  ID("enablepatterns").addEventListener('touchend', enablePatterns);

  var usageTips = function(e)
  {
    e.preventDefault();
    alert("Read tooltips on the buttons!\n\nPress Alt to pick colors\nPress X to swap colors\n\nOn touchscreen:\n" +
      "put one finger, tap with second finger on the left to undo,\non the right to redo");
  }
  ID("usagetips").addEventListener('mousedown', usageTips);
  ID("usagetips").addEventListener('touchend', usageTips);

  // ---

  ID("popupclose").addEventListener('click', function(e)
  {
    e.preventDefault();
    ID("popup").classList.remove("show");
  });


  document.addEventListener('keyup', function(e)
  {
    if (e.keyCode == 18) // Alt
    {
      ID("svgContainer").classList.remove("hidecursor");
      anbt.ShowEyedropperCursor(false);
    }
  });
  document.addEventListener('keydown', function(e)
  {
    if (document.activeElement instanceof HTMLInputElement) return true;
    if (e.keyCode == 18) // Alt
    {
      // Opera Presto refuses to hide cursor =(
      if (!navigator.userAgent.match(/\bPresto\b/))
      {
        ID("svgContainer").classList.add("hidecursor");
      }
      anbt.ShowEyedropperCursor(true);
      // The following is needed in case of Alt+Tab causing eyedropper to be stuck
      var removeEyedropper = function(e)
      {
        if (!e.altKey)
        {
          this.classList.remove("hidecursor");
          anbt.ShowEyedropperCursor(false);
          this.removeEventListener('mousemove', removeEyedropper);
        }
      };
      ID("svgContainer").addEventListener('mousemove', removeEyedropper);
    }
    else if (e.keyCode == "Z".charCodeAt(0))  // Z or Ctrl+Z
    {
      e.preventDefault();
      ID("play").classList.remove("pause");
      anbt.Undo();
    }
    else if (e.keyCode == "Y".charCodeAt(0))  // Y or Ctrl+Y
    {
      e.preventDefault();
      ID("play").classList.remove("pause");
      anbt.Redo();
    }
    else if (e.keyCode == "X".charCodeAt(0))  // X
    {
      e.preventDefault();
      var c0 = anbt.color[0];
      var c1 = anbt.color[1];
      anbt.SetColor(0, c1);
      anbt.SetColor(1, c0);
      updateColorIndicators();
    }
    else if (e.keyCode == "B".charCodeAt(0))  // B
    {
      e.preventDefault();
      chooseBackground = true;
      ID("colors").classList.add("setbackground");
      ID("setbackground").classList.add("sel");
    }
    else if (e.keyCode == "E".charCodeAt(0) && !e.ctrlKey)  // E but not Ctrl+E
    {
      e.preventDefault();
      anbt.SetColor(0, "eraser");
      updateColorIndicators();
    }
    else if (e.keyCode >= 48 && e.keyCode <= 57 && !e.ctrlKey)  // Numbers 1 to 0
    {
      e.preventDefault();
      // "0" is 9, "1" to "9" is 0 to 8.
      var i = (e.keyCode == 48) ? 9 : e.keyCode - 49;
      var els = ID("colors").querySelectorAll("b");

      if (chooseBackground)  // 1 to 0, and Shift + 1 to 0
      {
        if (e.shiftKey) i += 8;
        if (i < els.length && els[i].id != "eraser")
        {
          var color = els[i].style.backgroundColor;
          anbt.SetBackground(color);
          chooseBackground = false;
          ID("colors").classList.remove("setbackground");
          ID("setbackground").classList.remove("sel");
        }
      } else {  // 1 to 0 toggle between two colors
        i *= 2;
        if (i < els.length)
        {
          var color = els[i].style.backgroundColor;
          if (els[i].id == "eraser") color = "eraser";

          if (anbt.color[0] == color && i + 1 < els.length)
          {
            i += 1;
            var color = els[i].style.backgroundColor;
            if (els[i].id == "eraser") color = "eraser";
          }
          anbt.SetColor(0, color);
          updateColorIndicators();
        }
      }

    }
    else if (e.keyCode == "F".charCodeAt(0) && e.shiftKey)  // Shift+F
    {
      e.preventDefault();
      anbt.ClearWithColor(anbt.color[0]);
    }
    else if ((e.keyCode == 189 || e.keyCode == 219) && !e.ctrlKey) // - or [
    {
      e.preventDefault();
      for (var i = 1; i < brushSizes.length; i++)
      {
        if (anbt.size - brushSizes[i] < 0.01)
        {
          ID("brush" + (i - 1)).click();
          break;
        }
      }
    }
    else if ((e.keyCode == 187 || e.keyCode == 221) && !e.ctrlKey) // = or ]
    {
      e.preventDefault();
      for (var i = 0; i < brushSizes.length - 1; i++)
      {
        if (anbt.size - brushSizes[i] < 0.01)
        {
          ID("brush" + (i + 1)).click();
          break;
        }
      }
    }
    else if (e.keyCode == "A".charCodeAt(0) && !e.ctrlKey) // A for brush size
    {
      e.preventDefault();
      ID("brush0").click();
    }
    else if (e.keyCode == "S".charCodeAt(0) && !e.ctrlKey) // S for brush size
    {
      e.preventDefault();
      ID("brush1").click();
    }
    else if (e.keyCode == "D".charCodeAt(0) && !e.ctrlKey) // D for brush size
    {
      e.preventDefault();
      ID("brush2").click();
    }
    else if (e.keyCode == "F".charCodeAt(0) && !e.ctrlKey) // F for brush size
    {
      e.preventDefault();
      ID("brush3").click();
    }
    else if (e.keyCode == 32 && !e.ctrlKey && !e.altKey && !e.shiftKey)  // Space
    {
      playCommonDown(e);
    }
  });
  window.onerror = function(e)
  {
    alert(e);
  };
  window.onbeforeunload = function(e)
  {
    if (anbt.unsaved) return "You haven't saved the drawing. Abandon?";
  };
  (function fixPluginGoingAWOL()
  {
    var stupidPlugin = ID("wacom");
    var container = ID("wacomContainer");
    window.onblur = function(e)
    {
      if (container.childNodes.length === 1) container.removeChild(stupidPlugin);
    };
    window.onfocus = function(e)
    {
      if (container.childNodes.length === 0) container.appendChild(stupidPlugin);
    };
  })();
}

function runTimer()
{
  setInterval(function()
  {
    var s = (timerStart - Date.now()) / 1000;
    if (timerCallback) timerCallback(s);
    s = Math.abs(s);
    var m = Math.floor(s / 60);
    s = Math.floor(s % 60);
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    ID("timer").childNodes[0].nodeValue = m + ':' + s;
  },
  500);
}

function main()
{
  anbt.BindContainer(ID("svgContainer"));
  bindEvents();
  ID("svgContainer").style.background = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAHElEQVR4AWPYgAM8wAFoo2FUAy4JXAbRRMOoBgD42lgf5s146gAAAABJRU5ErkJggg==")';
  if (window.location.hash.length > 7)
  {
    var id = window.location.hash.substr(1);
    anbt.FromImgur(id);
  }
  timerStart = Date.now();
  runTimer();
}

main();
