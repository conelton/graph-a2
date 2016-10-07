// global variables
var
  ui, // object containing UI methods and properties
  graph, // graph methods and properties
  validate, // validation methods
  parseMathExpression, // function exported from equation_input.js
  equations = {}; // object holding list of equations indexed by ID

// event handler for document's "DOMContentLoaded" event
// i.e. runs on page load
function onDOMContentLoaded (event) {
  
  // tell the graph where to put it's canvas elements
  graph.setContainer(document.querySelector('#ctnGraph'));
  resetGraph();
  
  populateColorSelectionBox(ui.colors);
  
}

// restore the graph to safe default values
function resetGraph () {
  
  graph.failsafe();
  graph.calibrateCanvases();
  graph.zoomX = 10;
  graph.zoomY = 10;
  graph.centerX = 0;
  graph.centerY = 0;
  graph.refresh();
  
}

// fill the select box on the "Add New Equations" popup with the
//   colour choices listed in the UI object
function populateColorSelectionBox (colors) {
  
  var
    slcNewEquationColor;
  
  slcNewEquationColor = document.querySelector('#slcNewEquationColor');
  colors.forEach(function forEachColor (color) {
    
    var
      option;
    
    option = '<option value="' + color.value + '">' + color.label + '</option>';
    slcNewEquationColor.innerHTML += option;
    
  });
  
}

// generate a (pseudo-)unique identifier string
function generateId (length) {
  
  var
    seed = Math.random(),
    string;
  
  string = seed.toString(36).slice(2);
  if (validate.positive(length))
    string = string.slice(0, length);
  return string;
  
}

// add an equation to the equation list and the graph
//   given the input from the !Add New Equation" popup
function addEquation (equationInput, color) {
  
  var
    rpnExpression,
    graphEquation,
    id;
  
  // function which maps x- to y-values
  // i.e. evaluates the expression
  var plotter = function (x) {
    return rpnExpression.evaluate({ x: x });
  };
  
  // handle errors thrown by equation_input.js
  try {
    rpnExpression = parseMathExpression(equationInput);
    // dry-run the expression to check for evaluation errors
    rpnExpression.evaluate({ x: 0 });
  }
  catch (error) {
    // only catch errors thrown deliberately
    if (error.type === 'EquationError')
      ui.displayMessage('Invalid equation', error.message);
    // re-throw the error (to halt script execution and log the exception)
    throw error;
  }
  
  graphEquation = graph.addEquation(plotter, color, true);
  
  // create an ID for the equation
  id = generateId();
  // add it to the equations object
  equations[id] = {
    graphEquation: graphEquation,
    input: equationInput
  };
  
  ui.addEquationListItem(id, equationInput, color, true);
  
  graph.plotEquation(graphEquation);
  
}

function removeEquation (id) {
  
  var
    graphEquation;
  
  graphEquation = equations[id].graphEquation;
  graph.removeEquation(graphEquation);
  delete equations[id];
  
}

ui = initUi();
graph = initGraph();
parseMathExpression = initEquationInput();
validate = initValidation();

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);