// initialises the graph object and returns it
function initGraph () {
  
  var
    graph; // object returned
  
  // take a point on the graph and return the corresponding point on the canvas
  function graphToCanvasX (graphX) {
    
    return (graphX - graph.minX) * graph.zoomX;
    
  }
  
  // as above
  function graphToCanvasY (graphY) {
    
    return graph.height - ((graphY - graph.minY) * graph.zoomY);
    
  }
  
  // as above, vice versa
  function canvasToGraphX (canvasX) {
    
    return (canvasX / graph.zoomX) + graph.minX;
    
  }
  
  // as above
  function canvasToGraphY (canvasY) {
    
    return ((graph.height - canvasY) / graph.zoomY) + graph.minY;
    
  }
  
  // at intervals of x across the graph (including the exact origin),
  //   execute the specified action
  // "thisValue" is used with action.call to provide a context
  function atIntervalsOfX (interval, action, thisValue) {
    
    var
      start = graph.minX - (graph.minX % interval),
      graphX,
      canvasX;
      
    for (graphX = start; graphX < graph.maxX; graphX += interval) {
      canvasX = graphToCanvasX(graphX);
      action.call(thisValue, graphX, canvasX);
    }
    
  }
  
  // as above
  function atIntervalsOfY (interval, action, thisValue) {
    
    var
      start = graph.minY - (graph.minY % interval),
      graphY,
      canvasY;
    
    for (graphY = start; graphY < graph.maxY; graphY += interval) {
      canvasY = graphToCanvasY(graphY);
      action.call(thisValue, graphY, canvasY);
    }
    
  }
  
  function createCanvas () {
    
    var
      newCanvas;
    
    newCanvas = document.createElement('canvas');
    newCanvas.getContext('2d').translate(-0.5, -0.5); // fix pixel offset
    newCanvas.className = 'graphCanvas';
    graph.container.appendChild(newCanvas);
    fixCanvasSize(newCanvas);
    return newCanvas;
    
  }
  
  // match the canvas' render size to its on-screen sive
  function fixCanvasSize (canvas) {
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
  }
    
  graph = {
    
    container: undefined,
    staticCanvas: undefined, // canvas for static elements (grid, axes)
    
    // empty equation list
    equations: [],
    
    // default scale
    minX: -10,
    minY: -10,
    maxX: 10,
    maxY: 10,
    
    // desired pixels between axis labels
    targetInterval: 200,
    
    backgroundColor: '#FFF',
    
    grid: {
      color: '#EEE',
      intervalX: 1,
      intervalY: 1
    },
    
    axes: {
      color: '#000'
    },
    
    labels: {
      color: '#000',
      font: 'monospace',
      intervalX: 1,
      intervalY: 1
    },
    
    // returns all canvases (static + equations)
    get allCanvases () {
      
      var
        allCanvases = [];
      
      allCanvases.push(graph.staticCanvas);
      graph.equations.forEach(function (equation) {
        allCanvases.push(equation.canvas);
      });
      return allCanvases;
      
    },
    
    // map canvas dimensions as properties of this object
    get width () {
      
      return graph.staticCanvas.width;
      
    },
    
    set width (width) {
      
      graph.allCanvases.forEach(function (canvas) {
        canvas.width = width;
      });
      
    },
    
    get height () {
      
      return graph.staticCanvas.height;
      
    },
    
    set height (height) {
      
      graph.allCanvases.forEach(function (canvas) {
        canvas.height = height;
      });
      
    },
    
    // range = length of axis
    get rangeX () {
      
      return graph.maxX - graph.minX;
      
    },
    
    set rangeX (rangeX) {
      
      var
        centerX = graph.centerX,
        halfRangeX = rangeX / 2;
        
      graph.minX = centerX - halfRangeX;
      graph.maxX = centerX + halfRangeX;
      
    },
    
    get rangeY () {
      
      return graph.maxY - graph.minY;
      
    },
    
    set rangeY (rangeY) {
      
      var
        centerY = graph.centerY,
        halfRangeY = rangeY / 2;
        
      graph.minY = centerY - halfRangeY;
      graph.maxY = centerY + halfRangeY;
      
    },
    
    // zoom = ration between graph size and canvas size
    get zoomX () {
      
      return graph.width / graph.rangeX;
      
    },
    
    set zoomX (zoomX) {
      
      graph.rangeX = graph.width / zoomX;
      
    },
    
    get zoomY () {
      
      return graph.height / graph.rangeY;
      
    },
    
    set zoomY (zoomY) {
      
      graph.rangeY = graph.height / zoomY;
      
    },
    
    // center = co-ord at center of view
    get centerX () {
      
      return graph.minX + graph.rangeX / 2;
      
    },
    
    set centerX (centerX) {
      
      var
        halfRangeX = graph.rangeX / 2;
      
      graph.minX = centerX - halfRangeX;
      graph.maxX = centerX + halfRangeX;
      
    },
    
    get centerY () {
      
      return graph.minY + graph.rangeY / 2;
      
    },
    
    set centerY (centerY) {
      
      var
        halfRangeY = graph.rangeY / 2;
      
      graph.minY = centerY - halfRangeY;
      graph.maxY = centerY + halfRangeY;
      
    },
    
    // origin = canvas location of graph's origin
    get originX () {
      
      return -graph.minX * graph.zoomX;
      
    },
    
    set originX (originX) {
      
      var
        delta = (originX - graph.originX) / graph.zoomX;
        
      this.minX -= delta;
      this.maxX -= delta;
      
    },
    
    get originY () {
      
      return this.height - (-graph.minY * graph.zoomY);
      
    },
    
    set originY (originY) {
      
      var
        delta = (graph.originY - originY) / graph.zoomY;
        
      this.minY -= delta;
      this.maxY -= delta;
      
    },
    
    addEquation: function (plotter, color, visible) {
      
      var
        equation;
      
      equation = {
        plotter: plotter,
        color: color,
        visible: visible,
        canvas: createCanvas()
      };
      
      graph.equations.push(equation);
      
      return equation;
      
    },
    
    removeEquation: function (equation) {
      
      var
        index;
      
      index = graph.equations.indexOf(equation);
      
      if (index > -1) {
        graph.container.removeChild(equation.canvas);
        graph.equations.splice(index, 1);
      }
      
    },
    
    // calculate the best way to draw the axis labels and grid lines
    calibrateStatics: function () {
      
      var
        width = graph.width,
        height = graph.height,
        rangeX = graph.rangeX,
        rangeY = graph.rangeY,
        targetInterval = graph.targetInterval,
        tickX,
        tickY;
      
      function calculateBestTick (size, range, targetInterval) {
        
        var
          goodTicks = [1, 2, 5], // values we would like to use for ticks
          uglyTick, // tick that would achieve perfect targetInterval
          orderOfMag; // order of magnitude (power of 10) we are working in
        
        function findNearestTick () {
          
          var
            index = 0, // loop counter
            lowerTick, // tick nearest below uglyTick
            higherTick; // tick nearest above uglyTick
            
          function calculateError (tick) {
            var interval = size / (range / lowerTick);
            return Math.abs(interval - targetInterval);
          }
          
          // find the goodTicks above and below uglyTick
          while (uglyTick > goodTicks[index])
            index++;
          lowerTick = goodTicks[index - 1];
          higherTick = goodTicks[index];
          
          // return the tick nearest to targetInterval
          if (calculateError(lowerTick) <= calculateError(higherTick))
            return lowerTick;
          else
            return higherTick;
          
        }
        
        // find the theoretical best tick
        uglyTick = range / (size / targetInterval);
        // find its order of magnitude
        orderOfMag = Math.floor(Math.log(uglyTick) / Math.LN10);
        // scale the other ticks to match
        goodTicks = goodTicks.map(function (value) {
          return value * Math.pow(10, orderOfMag);
        });
        
        // if the uglyTick is a goodTick then use that
        if (goodTicks.indexOf(uglyTick) !== -1)
          return uglyTick;
        // otherwise find the nearest goodTick
        else
          return findNearestTick();
        
      }
      
      tickX = calculateBestTick(width, rangeX, targetInterval);
      tickY = calculateBestTick(height, rangeY, targetInterval);
      
      graph.grid.intervalX = tickX / 2;
      graph.grid.intervalY = tickY / 2;
      graph.labels.intervalX = tickX;
      graph.labels.intervalY = tickY;
      
    },
    
    // draw axes, labels, and grid lines
    drawStatics: function () {
      
      var
        ctx = graph.staticCanvas.getContext('2d'),
        originX = graph.originX,
        originY = graph.originY,
        width = graph.width,
        height = graph.height,
        xAxisOffset = -4, // distance between x-axis and labels
        yAxisOffset = 4; // distance between y-axis and labels
      
      // make labels for large or small numbers look pretty
      function formatLabelText (number) {
        
        var
          abs = Math.abs(number),
          result;
          
        if (abs > 10000000)
          result = number.toExponential(1);
        else if (abs > 0.01)
          result = number.toLocaleString();
        else if (abs > 0.0000000000000001)
          result = number.toExponential(1);
        else
          result = '0';
        
        return result;
        
      }
      
      function drawVerticalGridLine (graphX, canvasX) {
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
      }
      
      function drawHorizontalGridLine (graphY, canvasY) {
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
      }
      
      function drawXAxisLabel (graphX, canvasX) {
        // mark
        ctx.beginPath();
        ctx.moveTo(canvasX, originY - yAxisOffset);
        ctx.lineTo(canvasX, originY + yAxisOffset);
        ctx.stroke();
        // text
        ctx.fillText(formatLabelText(graphX), canvasX, originY + yAxisOffset);
      }
      
      function drawYAxisLabel (graphY, canvasY) {
        // mark
        ctx.beginPath();
        ctx.moveTo(originX - xAxisOffset, canvasY);
        ctx.lineTo(originX + xAxisOffset, canvasY);
        ctx.stroke();
        // text
        ctx.fillText(formatLabelText(graphY), originX + xAxisOffset, canvasY);
      }
      
      ctx.fillStyle = graph.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 1;
      
      // GRID
      ctx.strokeStyle = graph.grid.color;
      ctx.beginPath();
      atIntervalsOfX(graph.grid.intervalX, drawVerticalGridLine);
      atIntervalsOfY(graph.grid.intervalY, drawHorizontalGridLine);
      ctx.stroke();
      
      // STICKY AXES
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      // if x-axis is off to the left of the view, stick to left edge
      if (originX < 0) {
        originX = -1;
        // move labels to be on the right of the axis
        xAxisOffset *= -1;
        ctx.textAlign = 'left';
      }
      // if x-axis is to the right of the view, stick to right edge
      else if (originX > graph.width)
        originX = graph.width + 1;
      // if y axis is above view, stick to top edge
      if (originY < 0)
        originY = -1;
      // if y axis is below view, stick to bottom edge
      else if (originY > graph.height) {
        originY = graph.height + 1;
        // move labels to be above axis
        yAxisOffset *= -1;
        ctx.textBaseline = 'bottom';
      }
      
      // AXES
      ctx.strokeStyle = graph.axes.color;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();
      
      // LABELS
      ctx.strokeStyle = graph.labels.color;
      ctx.fillStyle = graph.labels.color;
      ctx.font = graph.labels.font;
      atIntervalsOfX(graph.labels.intervalX, drawXAxisLabel);
      atIntervalsOfY(graph.labels.intervalY, drawYAxisLabel);
      
    },
    
    plotEquation: function (equation) {
      
      var
        ctx = equation.canvas.getContext('2d'),
        graphX,
        graphY,
        canvasX,
        canvasY;
      
      function plotPoint () {
        graphX = canvasToGraphX(canvasX);
        graphY = equation.plotter(graphX);
        canvasY = graphToCanvasY(graphY);
        ctx.lineTo(canvasX, canvasY);
      }
      
      ctx.clearRect(0, 0, graph.width, graph.height);
      
      // do not plot if equation is not visible
      if (equation.visible) {
        
        ctx.strokeStyle = equation.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // traverse the graph, plotting a point for each pixel in the x direction
        for (canvasX = 0; canvasX < graph.width; canvasX++)
          plotPoint();
        ctx.stroke();
            
      }
      
    },
    
    // plot all equations in list
    plotEquations: function () {
      
      graph.equations.forEach(graph.plotEquation);
      
    },
    
    // fix canvas size of all canvases
    calibrateCanvases: function () {
      
      graph.allCanvases.forEach(fixCanvasSize);
      
    },
    
    // re-calibrate and re-draw the graph
    refresh: function () {
      
      graph.calibrateStatics();
      graph.drawStatics();
      graph.plotEquations();
      
    },
    
    // reset to safe default values for scale
    failsafe: function () {
      
      this.minX = -10;
      this.maxX = 10;
      this.minY = -10;
      this.maxY = 10;
      
    },
    
    setContainer: function (container) {
      
      graph.container = container;
      graph.staticCanvas = createCanvas();
      
    },
    
    // return base64-encoded data-url image of current graph view
    exportImage: function () {
      
      /* As elements of the view are spread accross multiple canvases,
      they must first be transferred to a single canvas before they can be 
      captured together. To do this, we capture each individual canvas, layer
      the images on a new canvas, and then capture that canvas as our actual image. */
      
      var
        tempCanvas,
        ctx,
        data;
      
      // create a new canvas
      tempCanvas = createCanvas();
      ctx = tempCanvas.getContext('2d');
      
      // for each existing canvas...
      graph.allCanvases.forEach(function forEachCanvas (canvas) {
        
        // copy the canvas image onto the new canvas
        ctx.drawImage(canvas, 0, 0);
        
      });
      
      // capture the new canvas
      data = tempCanvas.toDataURL();
      
      // delete the new canvas
      graph.container.removeChild(tempCanvas);
      
      return data;
      
    }
    
  };
  
  return graph;
  
}