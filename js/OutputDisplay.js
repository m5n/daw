// Satisfy JSLint.
/*global YAHOO */

YAHOO.namespace("skindemo");

(function () {
    /**
     * Creates the attributes object for the the OutputDisplay instance.
     *
     * @method createAttributes
     * @param chartable {YAHOO.skindemo.InputSimulator} A chartable object.
     * @private
     */
    function createAttributes(chartable) {
        var ii,
            seriesDef,
            seriesColors,
            seriesFields = chartable.getYfieldNames(),
            keyField = chartable.getXfieldNames()[0],   // TODO: check if exists
            yAxis;

        seriesColors = ["0x00ff00", "0xff8000", "0xff0000"];
        seriesDef = [];
        for (ii = 0; ii < seriesFields.length; ii++) {
            seriesDef.push({
                yField: seriesFields[ii],
                style: {
                    color: seriesColors[ii]
                }
            });
        }

        yAxis = new YAHOO.widget.NumericAxis();
        yAxis.stackingEnabled = true;
        yAxis.minimum = 0;
        yAxis.maximum = 100;
        // TODO: make y-axis legend show 0-100, not 0-90

        return {
            xField: keyField,
            series: seriesDef,
            yAxis: yAxis,
            dataTipFunction: YAHOO.skindemo.OutputDisplay.tooltipFormatter,
            style: {
                animationEnabled: false,
                background: {
                    // TODO: ideally, show bgimg of app... 
                    alpha: 1,
                    color: 0x000000,
                    //       ... that doesn't work, not even with wmode,
                    //       ... so use a custom bgimg.
                    image: "img/outputBg.png"
                },
                font: {
                    color: 0xffffff
                }
            },
            wmode: "transparent",   // TODO: doesn't work... see stype.bg above
            //only needed for flash player express install
            expressInstall: "http://developer.yahoo.com/yui/examples/charts/assets/expressinstall.swf"
        };
    }

    /**
     * Executed when the input simulator fires the inputChange event.
     *
     * @method handleInputChange
     * @private
     */
    function handleInputChange() {
        this.refreshData();
    }

    /**
     * OutputDisplay class for the skindemo app.
     * Uses StackedColumnChart to mimic colored output "ranges".
     *
     * @namespace YAHOO.skindemo
     * @class OutputDisplay
     * @uses YAHOO.widget.StackedColumnChart
     * @constructor
     * @param containerId {HTMLElement} Container for the Flash Player instance.
     * @param inputSimulator {YAHOO.skindemo.InputSimulator} InputSimulator instance.
     */
    YAHOO.skindemo.OutputDisplay = function (containerId, inputSimulator) {
        // Must be set before constructor is called.
        YAHOO.widget.Chart.SWFURL = "yui-2.7.0/build/charts/assets/charts.swf";

        YAHOO.skindemo.OutputDisplay.superclass.constructor.call(this,
                containerId, inputSimulator, createAttributes(inputSimulator));

        // Substribe to input change events.
        inputSimulator.subscribe("inputChange", handleInputChange,
                inputSimulator, this);
    };

    // YAHOO.skindemo.OutputDisplay extends YAHOO.widget.StackedColumnChart.
    YAHOO.lang.extend(YAHOO.skindemo.OutputDisplay,
            YAHOO.widget.StackedColumnChart, {
        // These formatters need to be public so the Flash layer can use them.
        // TODO: make channels 0-based in code, but 1-based for display.
        xaxisFormatter: function (value) {
            // TODO: there's an invisible column that has value x+0.5... why?
            //return value + 1;
            return Math.floor(value) === value ? value + 1 : '';
        },

        tooltipFormatter: function (item, index, series) {
            // TODO: to avoid the sum, include "output" in the series.
            return "Channel: " + item.channel + "\nOutput: " +
                    Math.round(item.low + item.mid + item.high);
        }
    });
}());
