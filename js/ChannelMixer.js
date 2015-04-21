// Satisfy JSLint.
/*global YAHOO */

YAHOO.namespace("skindemo");

(function () {
    var self,
            channelCount;

    function fireOutputLevelChangeEvent(channel, level) {
        self.fireEvent("outputLevelChange", {
            channel: channel,
            level: level
        });
    }

    function fireMuteChangeEvent(channel, muted) {
        self.fireEvent("muteChange", {
            channel: channel,
            muted: muted
        });
    }

    function toggleMute(evt) {
        var ch = parseInt(this.getAttributeConfig('value').value, 10);
        fireMuteChangeEvent(ch, evt.newValue);
    }

    function init() {
        // TODO: make the range correspond to the legend.
        var ii, button, slider,
                initValue = 110, upLimit = 179, downLimit = 0;   // In pixels.

        function changeHandler(offsetFromStart) {
            var ch, offsetFromInitValue;
            ch = parseInt(this.id.substring("slider".length), 10);
            offsetFromInitValue = -(initValue + this.getValue());
            fireOutputLevelChangeEvent(ch, offsetFromInitValue);
        }

        for (ii = 1; ii <= channelCount; ii++) {
            button = new YAHOO.widget.Button({
                type: "checkbox",
                label: "Mute",
                value: ii,
                container: "mute" + ii
            });
            button.addListener("checkedChange", toggleMute);

            slider = YAHOO.widget.Slider.getVertSlider(
                    'slider' + ii, 'thumb' + ii, upLimit, downLimit);
            slider.setValue(-initValue, true);   // Use -initValue to move up.

            slider.subscribe('change', changeHandler);
        }
    }

    /**
     * ChannelMixer class for the skindemo app.
     *
     * @namespace YAHOO.skindemo
     * @class ChannelMixer
     * @uses YAHOO.widget.Slider
     * @constructor
     * @param numChannels {Number} Number of output channels.
     */
    YAHOO.skindemo.ChannelMixer = function (numChannels) {
        self = this;
        channelCount = numChannels;

        init();

        /**
         * Fired when there is a change in a channel's output level.
         *
         * @event mixLevelChange
         * @param channel {Number} The channel that changed.
         * @param value {Number} The new output level.
         */
        this.createEvent("outputLevelChange");

        /**
         * Fired when there is a change in a channel's mute state.
         *
         * @event muteChange
         * @param channel {Number} The channel that changed.
         * @param muted {Boolean} The new mute state.
         */
        this.createEvent("muteChange");
    };

    YAHOO.skindemo.ChannelMixer.prototype = {
        getChannelCount: function () {
            return channelCount;
        }
    };

    YAHOO.lang.augmentProto(YAHOO.skindemo.ChannelMixer,
            YAHOO.util.EventProvider);
}());
