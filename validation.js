// intialise the vlaidtion object with methods and properties, then return it
function initValidation () {
  
  var
    validate;
  
  // set up validation methods
  validate = {
    
    exists: function (value) {
      
      return (typeof value !== 'undefined') && (value !== null);
      
    },
    
    number: function (value) {
      
      return validate.exists(value) && !isNaN(value) && isFinite(value);
      
    },
    
    positive: function (value) {
      
      return validate.number(value) && value > 0;
      
    },
    
    string: function (value) {
      
      return validate.exists(value) && (
        typeof value === 'string' ||
        value instanceof String
      );
      
    },
    
    notEmpty: function (value) {
      
      return validate.string(value) && value !== '';
      
    },
    
    node: function (value) {
      
      return validate.exists(value) && value instanceof Node;
      
    },
    
    element: function (value) {
      
      return validate.exists(value) && value instanceof HTMLElement;
      
    }
    
  };
  
  return validate;
  
}