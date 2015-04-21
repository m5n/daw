// Satisfy JSLint.
/*global document, YAHOO */

YAHOO.namespace("skindemo");

YAHOO.skindemo.app = (function () {
    var inputSimulator;

    function togglePower(evt) {
        if (evt.newValue) {
            inputSimulator.start();
        } else {
            inputSimulator.stop();
        }
    }

    return {
        init: function () {
            var button, display, elts, ii, mixer;

            // Build a 16-channel mixer.
            mixer = new YAHOO.skindemo.ChannelMixer(16);

            // Simulate input for this demo.
            inputSimulator = new YAHOO.skindemo.InputSimulator(mixer);

            // Display the final output.
            display = new YAHOO.skindemo.OutputDisplay("outputArea",
                    inputSimulator);

            // Add a power button for the output display.
            // (Or: a way to start and stop the input simulator.)
            button = new YAHOO.widget.Button({
                type: "checkbox",
                label: "Power",
                container: "powerButton"
            });
            button.addListener("checkedChange", togglePower);

            // Other buttons to fill up the remaining area.
            // TODO: clean this up?
            elts = document.getElementsByTagName('button');
            for (ii = 0; ii < elts.length; ii++) {
                button = new YAHOO.widget.Button(elts[ii], {
                    type: "checkbox"
                });
            }
        }
    };
}());

YAHOO.util.Event.onDOMReady(YAHOO.skindemo.app.init);
