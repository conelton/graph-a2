// initialises the UI object and returns it
function initUi () {
  
  var
    ui,
    eventBindings;
  
  // runs on page load
  function onDOMContentLoaded (event) {
    
    ui.bindEvents(eventBindings, document);
    
  }
  
  ui = {
    
    // CSS class used for hidden HTML elements
    hiddenClassName: 'hidden',
    
    // properties related to graph mouse interactions
    panning: false,
    panPointX: undefined,
    panPointY: undefined,
    zoomFactor: 1.25,
    
    // choices for colour selection boxes
    colors: [
      { label: 'Red', value: '#FF0000' },
      { label: 'Brown', value: '#BF3F1F' },
      { label: 'Orange', value: '#FF7F00' },
      { label: 'Yellow', value: '#FFFF00' },
      { label: 'Green', value: '#00FF00' },
      { label: 'Cyan', value: '#00FFFF' },
      { label: 'Blue', value: '#0000FF' },
      { label: 'Purple', value: '#BF00FF' },
      { label: 'Magenta', value: '#FF00FF' },
      { label: 'Black', value: '#000000' },
      { label: 'Grey', value: '#7F7F7F' },
    ],
    
    // attaches event listeners to elements
    bindEvents: function (bindings, container) {
      
      // check that container is an element
      if (!validate.element(container))
        // if not, use document
        container = document;
      
      bindings.forEach(function forEachBinding (binding) {
        
        var
          elements;
        
        // bind in different ways depending on how the binding is defined
        switch (true) {
          case binding.hasOwnProperty('id'):
            elements = [container.querySelector('#'+binding.id)];
            break;
          case binding.hasOwnProperty('selector'):
            elements = [container.querySelector(binding.selector)];
            break;
          case binding.hasOwnProperty('selectorAll'):
            elements = container.querySelectorAll(binding.selectorAll);
            break;
          case binding.hasOwnProperty('node'):
            elements = [binding.node];
            break;
        }
        
        // convert to Array (to avoid NodeLists)
        elements = [].slice.call(elements);
        
        elements.forEach(function forEachElement (element) {
          if (validate.node(element) || element === window)
            element.addEventListener(binding.event, binding.listener);
        });
        
      });
      
    },
    
    showElement: function (element) {
      
      var
        classList;
        
      classList = element.className.split(' ');
      classList = classList.filter(function filterClassList (className) {
        return (className !== ui.hiddenClassName);
      });
      
      element.className = classList.join(' ');
      
    },
    
    hideElement: function (element) {
      
      var
        classList;
      
      classList = element.className.split(' ');
      if (classList.indexOf(ui.hiddenClassName) === -1)
        classList.push(ui.hiddenClassName);
      
      element.className = classList.join(' ');
      
    },
    
    // clone an element from #ctnTemplates and return the new element
    cloneTemplate: function (id) {
      
      var
        template,
        element;
      
      template = document.querySelector('#'+id).children[0];
      element = template.cloneNode(true);
      return element;
      
    },
    
    openPopupElement: function (popupElement) {
      
      var
        overlay;
        
      overlay = ui.cloneTemplate('tplPopupOverlay');
      overlay.appendChild(popupElement);
      document.body.appendChild(overlay);
      ui.showElement(overlay);
      
    },
    
    closePopupElement: function (popupElement) {
      
      ui.hideElement(popupElement.parentNode);
      document.querySelector('#ctnPopups').appendChild(popupElement);
      
    },
    
    openPopup: function (id) {
      
      ui.openPopupElement(document.querySelector('#'+id));
      
    },
    
    closePopup: function (id) {
      
      ui.closePopupElement(document.querySelector('#'+id));
      
    },
    
    displayMessage: function (title, message) {
      
      var
        popup,
        btnCloseMessage;
      
      function onCloseButtonClick (event) {
        ui.closePopupElement(popup);
        popup.parentNode.removeChild(popup);
      }
      
      popup = ui.cloneTemplate('tplMessage');
      popup.querySelector('.txtMessageTitle').textContent = title;
      popup.querySelector('.txtMessageBody').textContent = message;
      
      btnCloseMessage = popup.querySelector('.btnCloseMessage');
      btnCloseMessage.addEventListener('click', onCloseButtonClick);
      
      document.querySelector('#ctnPopups').appendChild(popup);
      ui.openPopupElement(popup);
      btnCloseMessage.focus();
      
    },
    
    getTextInput: function (title, message, validator, onSuccess) {
      
      var
        popup,
        form;
      
      function onFormSubmit (event) {
        
        var
          input,
          valid;
        
        event.preventDefault();
          
        input = popup.querySelector('.inpTextInput').value;
        valid = validator(input);
        if (!valid)
          ui.displayError('Invalid Input', 'Please try again.');
        else {
          ui.closePopupElement(popup);
          popup.parentNode.removeChild(popup);
          onSuccess(input);
        }
        
      }
      
      popup = ui.cloneTemplate('tplTextInput');
      popup.querySelector('.txtTextInputTitle').textContent = title;
      popup.querySelector('.txtTextInputMessage').textContent= message;
      
      form = popup.querySelector('.frmTextInput');
      form.addEventListener('submit', onFormSubmit);
      
      document.querySelector('#ctnPopups').appendChild(popup);
      ui.openPopupElement(popup);
      popup.querySelector('.inpTextInput').focus();
      
    },
    
    getChoiceInput: function (title, message, choices, defaultValue, onSuccess) {
      
      var
        popup,
        form,
        slcChoiceInput;
      
      function onFormSubmit (event) {
        
        var
          input;
        
        event.preventDefault();
        
        input = slcChoiceInput.value;
        ui.closePopupElement(popup);
        popup.parentNode.removeChild(popup);
        onSuccess(input);
        
      }
      
      popup = ui.cloneTemplate('tplChoiceInput');
      popup.querySelector('.txtChoiceInputTitle').textContent = title;
      popup.querySelector('.txtChoiceInputMessage').textContent = message;
      
      slcChoiceInput = popup.querySelector('.slcChoiceInput');
      choices.forEach(function forEachChoice (choice) {
        
        var
          option;
          
        option = document.createElement('option');
        option.value = choice.value;
        option.textContent = choice.label;
        slcChoiceInput.appendChild(option);
        
      });
      slcChoiceInput.value = defaultValue;
      
      form = popup.querySelector('.frmChoiceInput');
      form.addEventListener('submit', onFormSubmit);
      
      document.querySelector('#ctnPopups').appendChild(popup);
      ui.openPopupElement(popup);
      popup.querySelector('.slcChoiceInput').focus();
      
    },
    
    addEquationListItem: function (id, text, color, visible) {
      
      var
        li,
        btnRemoveEquation,
        chkEquationVisible,
        swatch;
      
      function onRemoveClick (event) {
        li.parentNode.removeChild(li);
        removeEquation(id);
        graph.refresh();
      }
      
      function onCheckboxChange (event) {
        ui.setEquationVisibility(id, chkEquationVisible.checked);
      }
      
      function onSwatchClick (event) {
        
        var
          title = 'Equation Colour',
          message = 'Choose a new colour for the equation',
          equation = equations[id].graphEquation;
        
        function onSuccess (value) {
          equation.color = value;
          swatch.style.backgroundColor = value;
          graph.refresh();
        }
        
        ui.getChoiceInput(title, message, ui.colors, equation.color, onSuccess);
        
      }
      
      li = ui.cloneTemplate('tplEquationListItem');
      li.querySelector('.swatch').style.backgroundColor = color;
      li.querySelector('.equation').textContent= text;
      
      btnRemoveEquation = li.querySelector('.btnRemoveEquation');
      btnRemoveEquation.addEventListener('click', onRemoveClick);
      
      chkEquationVisible = li.querySelector('.chkEquationVisible');
      chkEquationVisible.addEventListener('change', onCheckboxChange);
      chkEquationVisible.checked = visible;
      
      swatch = li.querySelector('.swatch');
      swatch.addEventListener('click', onSwatchClick);
      
      document.querySelector('#lstEquationList').appendChild(li);
      
    },
    
    setEquationVisibility: function (id, value) {
      
      equations[id].graphEquation.visible = value;
      graph.refresh();
      
    }
    
  };
  
  eventBindings = [
    
    {
      selectorAll: 'form',
      event: 'submit',
      listener: function onSubmit (event) {
        
        event.preventDefault();
        
      }
    },
    
    {
      id: 'btnAddEquation',
      event: 'click',
      listener: function onClick (event) {
        
        ui.openPopup('popAddEquation');
        document.querySelector('#frmAddEquation').reset();
        document.querySelector('#inpNewEquation').focus();
        
      }
    },
    
    {
      id: 'btnCancelAddEquation',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popAddEquation');
        
      }
    },
    
    {
      id: 'frmAddEquation',
      event: 'submit',
      listener: function onSubmit (event) {
        
        var
          popup,
          equationInput,
          color;
        
        popup = document.querySelector('#popAddEquation');
        equationInput = popup.querySelector('#inpNewEquation').value;
        color = popup.querySelector('#slcNewEquationColor').value;
        
        if (validate.notEmpty(equationInput)) {
          try {
            addEquation(equationInput, color);
          }
          catch (error) {
            if (error.name === 'EquationError')
              return;
            else
              throw error;
          }
          ui.closePopupElement(popup);
        }
        else {
          ui.displayMessage('Invalid Equation', 'Please enter an equation.');
        }
        
      }
    },
    
    {
      id: 'btnExportEquations',
      event: 'click',
      listener: function onClick (event) {
        
        var
          output = {},
          id,
          equation,
          data,
          textarea;
        
        for (id in equations) {
          equation = equations[id];
          output[id] = {
            input: equation.input,
            color: equation.graphEquation.color
          };
        }
        
        data = JSON.stringify(output);
        
        textarea = document.querySelector('#inpExportFile');
        textarea.value = data;
        ui.openPopup('popExportEquations');
        textarea.select();
        
      }
    },
    
    {
      id: 'btnExportClose',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popExportEquations');
        
      }
    },
    
    {
      id: 'btnImportEquations',
      event: 'click',
      listener: function onClick (event) {
        
        ui.openPopup('popImportEquations');
        document.querySelector('#frmImportEquations').reset();
        document.querySelector('#inpImportFile').focus();
        
      }
    },
    
    {
      id: 'btnImportCancel',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popImportEquations');
        
      }
    },
    
    {
      id: 'frmImportEquations',
      event: 'submit',
      listener: function onSubmit (event) {
        
        var
          popup,
          string,
          input,
          id;
        
        popup = document.querySelector('#popImportEquations');
        string = popup.querySelector('#inpImportFile').value;
        
        try {
          input = JSON.parse(string);
        }
        catch (error) {
          ui.displayMessage('Import failed', 'The file could not be parsed.');
        }
          
        for (id in input) {
          addEquation(input[id].input, input[id].color);
        }
        ui.closePopup('popImportEquations');
        
      }
    },
    
    {
      id: 'btnZoomIn',
      event: 'click',
      listener: function onClick (event) {
        
        graph.zoomX *= ui.zoomFactor;
        graph.zoomY *= ui.zoomFactor;
        graph.refresh();
        
      }
    },
    
    {
      id: 'btnZoomOut',
      event: 'click',
      listener: function onClick (event) {
        
        graph.zoomX /= ui.zoomFactor;
        graph.zoomY /= ui.zoomFactor;
        graph.refresh();
        
      }
    },
    
    {
      id: 'btnCustomScale',
      event: 'click',
      listener: function onClick (event) {
        
        var
          popup;
        
        popup = document.querySelector('#popCustomScale');
        popup.querySelector('#inpCustomScaleMinX').value = graph.minX;
        popup.querySelector('#inpCustomScaleMaxX').value = graph.maxX;
        popup.querySelector('#inpCustomScaleMinY').value = graph.minY;
        popup.querySelector('#inpCustomScaleMaxY').value = graph.maxY;
        
        ui.openPopupElement(popup);
        popup.querySelector('#inpCustomScaleMaxY').focus();
        
      }
    },
    
    {
      id: 'btnCustomScaleCancel',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popCustomScale');
        
      }
    },
    
    {
      id: 'frmCustomScale',
      event: 'submit',
      listener: function onSubmit (event) {
        
        var
          form,
          minX,
          maxX,
          minY,
          maxY;
        
        function onError () {
          ui.displayMessage('Invalid Input', 'Please try again.');
        }
        
        form = document.querySelector('#frmCustomScale');
        minX = parseFloat(form.querySelector('#inpCustomScaleMinX').value);
        maxX = parseFloat(form.querySelector('#inpCustomScaleMaxX').value);
        minY = parseFloat(form.querySelector('#inpCustomScaleMinY').value);
        maxY = parseFloat(form.querySelector('#inpCustomScaleMaxY').value);
        
        if (isNaN(minX) || isNaN(maxX) || isNaN(minY) || isNaN(maxY))
          onError();
        else if (minX >= maxX)
          onError();
        else if (minY >= maxY)
          onError();
        else {
          graph.minX = minX;
          graph.maxX = maxX;
          graph.minY = minY;
          graph.maxY = maxY;
          graph.refresh();
          ui.closePopup('popCustomScale');
        }
        
      }
    },
    
    {
      id: 'btnResetView',
      event: 'click',
      listener: function onClick (event) {
        
        resetGraph();
        
      }
    },
    
    {
      id: 'btnSaveImage',
      event: 'click',
      listener: function onClick (event) {
        
        var
          lnkSaveImage;
        
        lnkSaveImage = document.querySelector('#lnkSaveImage');
        lnkSaveImage.href = graph.exportImage();
        ui.openPopup('popSaveImage');
        lnkSaveImage.focus();
        
      }
    },
    
    {
      id: 'btnSaveImageClose',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popSaveImage');
        
      }
    },
    
    {
      id: 'btnHelp',
      event: 'click',
      listener: function onClick (event) {
        
        ui.openPopup('popHelp');
        
      }
    },
    
    {
      id: 'btnHelpClose',
      event: 'click',
      listener: function onClick (event) {
        
        ui.closePopup('popHelp');
        
      }
    },
    
    {
      id: 'ctnGraph',
      event: 'mousedown',
      listener: function onMouseDown (event) {
        
        if (event.button === 0) {
          ui.panning = true;
          ui.panPointX = event.clientX - graph.originX;
          ui.panPointY = event.clientY - graph.originY;
        }
        
      }
    },
    
    {
      node: document,
      event: 'mousemove',
      listener: function onMouseMove (event) {
        
        if (ui.panning) {
          event.preventDefault();
          graph.originX = event.clientX - ui.panPointX;
          graph.originY = event.clientY - ui.panPointY;
          graph.refresh();
        }
        
      }
    },
    
    {
      node: document,
      event: 'mouseup',
      listener: function onMouseUp (event) {
        
        if (event.button === 0)
          ui.panning = false;
        
      }
    },
    
    {
      node: document,
      event: 'mouseleave',
      listener: function onMouseLeave (event) {
        
        ui.panning = false;
        
      }
    },
    
    {
      id: 'ctnGraph',
      event: 'wheel',
      listener: function onWheel (event) {

        var
          wheelDelta = 0, // number of ticks the wheel scrolled
          zoomDelta; // total scale factor applied
          
        // handle browsers reporting wheel events differently
        if (event.wheelDelta)
          wheelDelta = event.wheelDelta / 120; // chrome
        else if (event.deltaY && event.deltaMode === 1)
          wheelDelta = -event.deltaY / 3; // firefox
        else if (event.deltaY && event.deltaMode === 0)
          wheelDelta = -event.deltaY / 115; // IE
        
        zoomDelta = Math.pow(ui.zoomFactor, wheelDelta); 
        
        graph.zoomX *= zoomDelta;
        graph.zoomY *= zoomDelta;
        graph.refresh();

      }
    },
    
    {
      node: window,
      event: 'resize',
      listener: function onResize (event) {
        
        var
          zoomX = graph.zoomX,
          zoomY = graph.zoomY,
          centerX = graph.centerX,
          centerY = graph.centerY;
        
        graph.calibrateCanvases();
        graph.zoomX = zoomX;
        graph.zoomY = zoomY;
        graph.centerX = centerX;
        graph.centerY = centerY;
        graph.refresh();
        
      }
    }
  
  ];
  
  // attach event to page load
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  
  return ui;
  
}