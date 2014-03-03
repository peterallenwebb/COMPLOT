COMPLOT.ParamWidget = function(hostElement) {
    
    var realInput;
    var imgInput;
    var callbacks = [];
    
    var realVal = 0.0;
    var imgVal = 0.0;
    
    function realChange() {
        realVal = this.value / 50.00 - 1.0;
        raiseChange();
    }
    
    function imgChange() {
        imgVal = this.value / 50.00 - 1.0;
        raiseChange();
    }
    
    function raiseChange() {
        for (var idx in callbacks) {
            callbacks[idx]({ real: realVal, img: imgVal });
        }
    }
    
    this.onChange = function(callback) {
        callbacks.push(callback);
    }
    
    var widgetDiv = $('<div class="complot_paramWidget" />');
    
    realInput = $('<input type="range" min="0" max="100" />');
    imgInput = $('<input type="range" min="0" max="100" />');
    $(widgetDiv).append(realInput);
    $(widgetDiv).append(imgInput);
    realInput.change(realChange);
    imgInput.change(imgChange);
    
    $(hostElement).append(widgetDiv);
}