function initEquationInput () {
  
  // this is the only function which is exported from the closure
  // arguments:
  // - string: string; the string to be parsed
  // returns: rpnExpression
  var parseMathExpression = function (string) {
    
    var inputString = new InputString(string);
    var infixExpression = inputString.toInfix();
    var rpnExpression = infixExpression.toRPN();
    return rpnExpression;
    
  };
  
  // tells the program how to recognise each token type
  // either a single value, an array of values, or a regular expression
  var typeDefinitions = {
    sign: ['+', '-'],
    number: /(\d*\.)?\d+/,
    variable: 'x',
    constant: ['e', 'pi'],
    function: ['sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan', 'ln', 'log2', 'log10', 'log'],
    comma: ',',
    open_bracket: '(',
    close_bracket: ')',
    operator: ['^', '*', '/', '+', '-']
  };
  
  // which token types can follow which token types?
  // does not allow for implied multiplication (e.g. 3x instead of 3*x)
  var typeFollowers = {
    'sign': ['number', 'variable', 'constant', 'function', 'open_bracket'],
    'number': ['operator', 'close_bracket'],
    'variable': ['operator', 'close_bracket'],
    'constant': ['operator', 'close_bracket'],
    'function': ['open_bracket'],
    'comma': ['sign', 'number', 'variable', 'constant', 'function', 'open_bracket'],
    'open_bracket': ['sign', 'number', 'variable', 'constant', 'function', 'open_bracket'],
    'close_bracket': ['close_bracket', 'operator'],
    'operator': ['sign', 'number', 'variable', 'constant', 'function', 'open_bracket']
  };
  
  // which token types can be part of implied multiplication (e.g. 3x)
  var impliedMultiplication = {
    'leaders': ['number', 'variable', 'constant', 'close_bracket'],
    'followers': ['number', 'variable', 'constant', 'function', 'open_bracket']
  };

  // properties of the supported operators
  var operators = {
    '^': { precedence: 4, associativity: 'right' },
    '*': { precedence: 3, associativity: 'left' },
    '/': { precedence: 3, associativity: 'left' },
    '+': { precedence: 2, associativity: 'left' },
    '-': { precedence: 2, associativity: 'left' }
  };
  
  // how to execute each of the operators, with operands passed in as args
  var operations = {
    '^': function (o1, o2) {
      return Math.pow(o1, o2);
    },
    '*': function (o1, o2) {
      return o1 * o2;
    },
    '/': function (o1, o2) {
      return o1 / o2;
    },
    '+': function (o1, o2) {
      return o1 + o2;
    },
    '-': function (o1, o2) {
      return o1 - o2;
    }
  };
  
  // define mathematical constants and their values
  var constants = {
    'e': Math.E,
    'pi': Math.PI
  };
  
  // define mathematical functions and how to execute them
  var functions = {
    sin: function (o1) {
      return Math.sin(o1);
    },
    cos: function (o1) {
      return Math.cos(o1);
    },
    tan: function (o1) {
      return Math.tan(o1);
    },
    arcsin: function (o1) {
      return Math.asin(o1);
    },
    arccos: function (o1) {
      return Math.acos(o1);
    },
    arctan: function (o1) {
      return Math.atan(o1);
    },
    ln: function (o1) {
      return Math.log(o1);
    },
    log2: function (o1) {
      return Math.log(o1) / Math.LN2;
    },
    log10: function (o1) {
      return Math.log(o1) / Math.LN10;
    },
    log: function (o1, o2) {
      return Math.log(o1) / Math.log(o2);
    }
  };
  
  // CLASS constructor
  // An extension of String with some useful methods
  function InputString (string) {
    this.string = string;
    this.stringPosition = 0;
  }
  
  // CLASS methods
  InputString.prototype = {
    
    // test if string starts with the given substring
    // return the substring if it's found
    startsWith: function (testString) {
      var inputString = this.string.toLowerCase();
      testString = testString.toLowerCase();
      return inputString.indexOf(testString) === 0 ? testString : false;
    },
    
    // test if string starts with any of the given substrings
    // return the matched substrings if any are found
    startsWithSome: function (testStrings) {
      var matches = [];
      testStrings.forEach(function (testString) {
        var result = this.startsWith(testString);
        if (result)
          matches.push(result);
      }, this);
      return matches.length > 0 ? matches : false;
    },
    
    // test if string starts with the given regular expression
    // return the match if it's found
    startsLike: function (testRegex) {
      return this.string.search(testRegex) === 0 ? this.string.match(testRegex)[0] : false;
    },
    
    // returns boolean of whether the string is empty
    get isEmpty () {
      return this.string.length === 0;
    },
    
    // removes whitespace from beginning and end of string
    trim: function () {
      this.string = this.string.trim();
    },
    
    // remove a token from the start of the string (having just read that token)
    removeToken: function (token) {
      var length = token.text.length;
      this.stringPosition += length;
      this.string = this.string.slice(length);
      this.string.trim();
    },
    
    // attempt to read a token of the given type at the start of the string
    // return the matching text(s) if it is found
    readTokenOfType: function (type) {
      var typeDefinition = typeDefinitions[type];
      var result;
      if (typeof typeDefinition === 'string')
        result = this.startsWith(typeDefinition);
      else if (typeDefinition instanceof Array)
        result = this.startsWithSome(typeDefinition);
      else if (typeDefinition instanceof RegExp)
        result = this.startsLike(typeDefinition);
      if (!result)
        throw new IncorrectTokenTypeError([type], this.stringPosition);
      else
        return result;
    },
    
    // test whether the string starts with a token of the given type
    // returns boolean answer
    testForType: function (type) {
      try {
        this.readTokenOfType(type);
      }
      catch (error) {
        return false;
      }
      return true;
    },
    
    // take a list of token types,
    // attempt to read them from the string,
    // and return the tokens that matched
    readTokensOfTypes: function (types) {
      var results = [];
      types.forEach(function (type) {
        var result;
        try {
          result = this.readTokenOfType(type);
          if (result instanceof Array) {
            var resultTokens = result.map(function (singleResult) {
              return new Token(type, singleResult);
            });
            results = results.concat(resultTokens);
          }
          else
            results.push(new Token(type, result));
        }
        catch (error) {
          return;
        }
      }, this);
      return results;
    },
    
    // get the next token from the start of the string
    // typeAmbiguityResolver is called when there is more than one possible type found
    readNextToken: function (lastType) {
      
      var token;
      
      var nextTypes = typeFollowers[lastType];
      var foundTokens = this.readTokensOfTypes(nextTypes);
      
      if (foundTokens.length === 0) {
        // if the problem could be fixed by inserting a '*' then try that
        if (impliedMultiplication.leaders.indexOf(lastType) !== -1)
          token = new Token('operator', '*');
        else
          throw new IncorrectTokenTypeError(nextTypes, this.stringPosition);
      }
      else if (foundTokens.length === 1) {
        token = foundTokens[0];
        this.removeToken(token);
      }
      else if (foundTokens.length > 1) {
        foundTokens = foundTokens.filter(function (token) {
          var possibleNextTypes = typeFollowers[token.type];
          var nextString = new InputString(this.string.slice(token.text.length));
          var foundNextTypes = possibleNextTypes.filter(this.testForType, nextString);
          return foundNextTypes.length > 0;
        }, this);
        token = foundTokens[0];
        this.removeToken(token);
      }
      
      return token;

    },
    
    // converts the string to a list of Token objects
    toInfix: function () {
      
      var lastType = 'open_bracket';
      var bracketDepth = 0;
      var token;
      
      var infixExpression = new InfixExpression();
      while (!this.isEmpty) {
        this.trim();
        token = this.readNextToken(lastType);
        infixExpression.push(token);
        lastType = token.type;
        if (token.type === 'open_bracket')
          bracketDepth++;
        else if (token.type === 'close_bracket')
          bracketDepth--;
      }
      
      if (bracketDepth !== 0)
        throw new MismatchedBracketsError(bracketDepth);
      
      return infixExpression;
    
    }

  };
  
  // CLASS constructor
  // Token objects have a type and a text property
  // this class has no special methods
  function Token (type, text) {
    this.type = type;
    this.text = text;
  }
  
  // CLASS methods
  Token.prototype = {
    
    evaluate: function (stack, substitutions) {
      
      switch (this.type) {
        
        case 'number':
          return parseFloat(this.text);
        
        case 'variable':
          return substitutions[this.text];
          
        case 'constant':
          return constants[this.text];
          
        case 'function':
          return functions[this.text];
          
        case 'operator':
          return operations[operator];
        
      }
      
    }
    
  };
  
  // CLASS constructor
  // an array of tokens
  // adds some useful methods over the standard Array
  // InfixExpression and RPNExpression inherit from this class
  function TokenList () {
    this.tokens = [];
  }
  
  // CLASS methods
  TokenList.prototype = {
    
    // replicate standard Array push
    push: function (token) {
      return Array.prototype.push.call(this.tokens, token);
    },
    
    // replicate standard Array pop, except pop form the start
    pop: function () {
      return Array.prototype.shift.call(this.tokens);
    },
    
    // returns the length of the token list
    get length () {
      return this.tokens.length;
    },
    
    //  returns boolean whether list is empty
    get isEmpty () {
      return this.tokens.length === 0;
    },
    
    // returns the first token in the list
    get firstToken () {
      return this.tokens[0];
    },
    
    // returns the list as a simple string
    // useful for debugging
    toString: function () {
      var tokenTexts = this.tokens.map(function (token) {
        return token.text;
      });
      return tokenTexts.join(' ');
    }
    
  };
  
  // CLASS constructor
  // Inherits from TokenList
  function InfixExpression () {
    TokenList.call(this);
  }
  
  // CLASS methods
  // Inherits from TokenList
  InfixExpression.prototype = Object.create(TokenList.prototype);
  
  // add method to convert from Infix to RPN expression
  InfixExpression.prototype.toRPN = function () {
    
    var 
      input = this, // input queue
      currentInputToken,
      output = new RPNExpression(), // output queue
      stack = []; // operator stack
    
    function pushInputToStack () {
      stack.push(input.pop());
    }
    
    function pushInputToOutput () {
      output.push(input.pop());
    }
    
    function popStackToOutput () {
      output.push(stack.pop());
    }
    
    function stackIsEmpty () {
      return stack.length < 1;
    }
    
    function getTopOfStack () {
      return stackIsEmpty() ? undefined : stack[stack.length - 1];
    }
    
    function inputHasLowPrecedence () {
      // get the input token and the stack token
      var inputToken = currentInputToken;
      var stackToken = getTopOfStack();
      // get details of both operators
      var inputOp = operators[inputToken.text];
      var stackOp = operators[stackToken.text];
      // there are 2 cases where we should return false
      // (these could be combined into a single 'if' with an OR but this seems easier to read)
      if (inputOp.associativity === 'left' &&
          inputOp.precedence <= stackOp.precedence)
        return true; 
      if (inputOp.associativity === 'right' &&
          inputOp.precedence < stackOp.precedence)
        return true;
      // if none of the above matched then input must be lower precedence
      return false;
    }
    
    while (!input.isEmpty) {
      
      currentInputToken = input.firstToken;
      
      switch (currentInputToken.type) {
        
        case 'sign':
          input.pop();
          output.push(new Token('number', '0'));
          pushInputToOutput();
          output.push(new Token('operator', '-'));
          break;
        
        case 'number':
        case 'variable':
        case 'constant':
          pushInputToOutput();
          break;
          
        case 'function':
          pushInputToStack();
          break;
          
        case 'comma':
          while (getTopOfStack().type !== 'open_bracket')
            popStackToOutput();
          break;
          
        case 'open_bracket':
          pushInputToStack();
          break;
          
        case 'close_bracket':
          // until the stack turns up an open bracket
          while (getTopOfStack().type !== 'open_bracket')
            // pop off the stack
            popStackToOutput();
          // once we reach the open bracket
          stack.pop(); // discard open bracket on stack
          input.pop(); // discard close bracket in input
          // if there's a function sitting on the stack, pop that too
          if (!stackIsEmpty() && getTopOfStack().type === 'function')
            popStackToOutput();
          break;
          
        case 'operator':
          while (!stackIsEmpty() &&
                 getTopOfStack().type === 'operator' &&
                 inputHasLowPrecedence())
            popStackToOutput();
          pushInputToStack();
          break;
        
      }
      
    }
    
    // pop anything left on the stack
    while (stack.length > 0)
      popStackToOutput();
      
    return output;
    
  };
  
  // CLASS constructor
  // Inherits from TokenList
  // Expression listed as token objects in RPN
  function RPNExpression () {
    TokenList.call(this);
  }
  
  // CLASS methods
  // Inherit from TokenList
  RPNExpression.prototype = Object.create(TokenList.prototype);
  
  // add method to evaluate RPN expression
  RPNExpression.prototype.evaluate = function (substitutions) {
    
    // get the argumenst from the stack for functions and operators
    function getArguments (fnName, numArgs) {
      if (stack.length < numArgs)
        throw new FunctionArgumentsError(fnName, numArgs);
      var results = [];
      for (var i = 0; i < numArgs; i++)
        results.push(stack.pop());
      return results.reverse();
    }
    
    function evaluateToken (token) {
      
      switch (token.type) {
        
        case 'number':
          return parseFloat(token.text);
          
        case 'constant':
          return constants[token.text];
          
        case 'variable':
          return substitutions[token.text];
          
        case 'function':
          var fn = functions[token.text];
          return fn.apply(this, getArguments(token.text, fn.length));
        
        case 'operator':
          return operations[token.text].apply(this, getArguments(token.text, 2));
        
      }

    }
    
    var stack = [];
    
    // evaluate each token in turn
    this.tokens.forEach(function (token) {
      stack.push(evaluateToken(token));
    });
    
    // there should be no tokens left on the stack
    if (stack.length === 1)
      return stack[0];
    else
      throw new EvaluationError();
    
  };
  
  // ERROR HANDLING
  // create some custom error object to be thrown by this script
  function IncorrectTokenTypeError (lookingFor, index) {
    Error.call(this);
    this.type = "EquationError";
    this.name = 'IncorrectTokenTypeError';
    this.index = index;
    this.message = 'Incorrect token type at position '+ index + '. Looked for "' + lookingFor.join('", "') + '" but failed.';
  }
  IncorrectTokenTypeError.prototype = Error.prototype;
  
  function MismatchedBracketsError (bracketDepth) {
    Error.call(this);
    this.type = "EquationError";
    this.name = 'MismatchedBracketsError';
    this.message = 'Mismatched brackets. ' + ((bracketDepth < 0) ? 'Remove ' : 'Add ') + Math.abs(bracketDepth) + ' closing brackets.';
  }
  MismatchedBracketsError.prototype = Error.prototype;
  
  function FunctionArgumentsError (functionName, numRequired) {
    Error.call(this);
    this.type = "EquationError";
    this.name = 'FunctionArgumentsError';
    this.message = 'Function "' + functionName + '" requires ' + numRequired + ' parameters.';
  }
  FunctionArgumentsError.prototype = Error.prototype;
  
  function EvaluationError () {
    Error.call(this);
    this.type = "EquationError";
    this.name = 'EvaluationError';
    this.message = 'Unable to evaluate the expression.';
  }
  EvaluationError.prototype = Error.prototype;
  
  // export the parseMathExpression function
  return parseMathExpression;
  
}