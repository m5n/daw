// Satisfy JSLint.
/*global YAHOO */

YAHOO.namespace("skindemo");

(function () {
    var self,
            channelCount,
            inputData = [],
            simulatorTimer,
            outputSimulationChangeDelay = 200,   // Milliseconds.
            fields = [ "channel", "low", "mid", "high" ];

    function fireInputChangeEvent() {
        self.fireEvent("inputChange");
    }

    function setOutputDataRanges(data) {
        var val = data.output;

        // Ranges are: low: 0-60, mid: 60-80, high: 80-100.
        if (val > 80) {
            data.high = val - 80;
            data.mid = 20;
            data.low = 60;
        } else if (val > 60) {
            data.high = 0;
            data.mid = val - 60;
            data.low = 60;
        } else {
            data.high = 0;
            data.mid = 0;
            data.low = val;
        }
    }

    function applySimulationValue(ch, val, useZeroValue) {
        if (val > 100) {
            val = 100;
        } else if (val < 0) {
            val = 0;
        }
        inputData[ch - 1].input = val;

        // Incorporate slider adjustments.
        val += inputData[ch - 1].level;

        if (useZeroValue) {
            // Force zero.
            val = 0;
        } else if (inputData[ch - 1].muted) {
            // Muted, so no output.
            val = 0;
        } else if (val > 100) {
            val = 100;
        } else if (val < 0) {
            val = 0;
        }
        inputData[ch - 1].output = val;

        setOutputDataRanges(inputData[ch - 1]);
    }

    function getInitSimulationValue(ch) {
        return 10 + Math.sin(Math.PI * (ch - 1) / channelCount) * 80;
    }

    function initChannel(ch) {
        var val;
        if (inputData[ch - 1].muted) {
            // Muted, so no output.
            val = 0;
        } else {
            val = getInitSimulationValue(ch);
        }
        applySimulationValue(ch, val);
        fireInputChangeEvent();
    }

    // Initializes the output data to look like a sinus wave.
    function initSimulationInputData(useZeroValue) {
        var ii, val = 0;
        for (ii = 0; ii < channelCount; ii++) {
            if (false === useZeroValue) {
                val = getInitSimulationValue(ii + 1);
            }
            applySimulationValue(ii + 1, val, useZeroValue);
        }
    }

    function simulateOutputChange() {
        var ii, adjustUp, val;
        for (ii = 0; ii < channelCount; ii++) {
            adjustUp = 1 === Math.round(Math.random());
            val = inputData[ii].input + (adjustUp ? 1 : -1);
            applySimulationValue(ii + 1, val);
        }
        fireInputChangeEvent();
    }

    function createOutputData(channelCount) {
        var ii, data;

        for (ii = 0; ii < channelCount; ii++) {
            data = {
                "channel": ii + 1,
                "muted": false,
                "level": 0
            };
            inputData.push(data);
            applySimulationValue(ii + 1, 0);
        }
        return inputData;
    }

    function isSimulatorRunning() {
        return undefined !== simulatorTimer;
    }

    function handleOutputLevelChange(eventArgs) {
        inputData[eventArgs.channel - 1].level = eventArgs.level;
        if (isSimulatorRunning()) {
            // Trigger update immediately.
            simulateOutputChange();
        }
    }

    function handleMuteChange(eventArgs) {
        inputData[eventArgs.channel - 1].muted = eventArgs.muted;
        if (isSimulatorRunning()) {
            // Trigger update immediately.
            if (eventArgs.muted) {
                // Just update to clear the input.
                simulateOutputChange();
            } else {
                // Value could have become 0 while this channel was muted, 
                // so to make sure there's a non-0 value, use init value.
                initChannel(eventArgs.channel);
            }
        }
    }

    /**
     * InputSimulator class for the skindemo app.
     *
     * @namespace YAHOO.skindemo
     * @class InputSimulator
     * @uses YAHOO.util.LocalDataSource
     * @constructor
     * @param mixer {YAHOO.skindemo.Mixer} The mixer to simulate input for.
     */
    YAHOO.skindemo.InputSimulator = function (mixer) {
        self = this;
        channelCount = mixer.getChannelCount();

        YAHOO.skindemo.InputSimulator.superclass.constructor.call(this,
                createOutputData(channelCount));
        this.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
        this.responseSchema = {
            fields: fields
        };

        // Substribe to mixer's output level change events.
        mixer.subscribe("outputLevelChange", handleOutputLevelChange,
                mixer, this);

        // Substribe to mixer's mute state change events.
        mixer.subscribe("muteChange", handleMuteChange, mixer, this);

        // TODO: For a real simulator, more granular events are needed,
        //       but for this demo, only one event is needed.
        /**
         * Fired when there is a change in any of the input values.
         *
         * @event inputChange
         */
        this.createEvent("inputChange");
    };

    // InputSimulator extends LocalDataSource.
    YAHOO.lang.extend(YAHOO.skindemo.InputSimulator,
            YAHOO.util.LocalDataSource, {
        // TODO: refactor this method into a "chartable" interface.
        getXfieldNames: function () {
            return [ fields[0] ];
        },

        // TODO: refactor this method into a "chartable" interface.
        getYfieldNames: function () {
            return [ fields[1], fields[2], fields[3] ];
        },

        start: function () {
            initSimulationInputData(false); 
            fireInputChangeEvent();

            simulatorTimer = YAHOO.lang.later(outputSimulationChangeDelay,
                    this, simulateOutputChange, null, true);
        },

        stop: function () {
            simulatorTimer.cancel();
            simulatorTimer = undefined;

            // Clear output area.
            initSimulationInputData(true);
            fireInputChangeEvent();
        }
    });

    // TODO: is this really needed?
    // Copy static members to LocalDataSource class.
    YAHOO.lang.augmentObject(YAHOO.skindemo.InputSimulator,
            YAHOO.util.LocalDataSource);
}());
