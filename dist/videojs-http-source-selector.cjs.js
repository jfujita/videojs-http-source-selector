'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var videojs = _interopDefault(require('video.js'));

var version = "1.1.5";

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var MenuItem = videojs.getComponent('MenuItem');

var SourceMenuItem = function (_MenuItem) {
  inherits(SourceMenuItem, _MenuItem);

  function SourceMenuItem(player, options) {
    classCallCheck(this, SourceMenuItem);

    var _this = possibleConstructorReturn(this, _MenuItem.call(this, player, options));

    options.selectable = true;
    return _this;
  }

  SourceMenuItem.prototype.handleClick = function handleClick() {
    var selected = this.options_;
    console.log("Changing quality to:", selected.label);

    this.selected_ = true;
    this.selected(true);

    var levels = this.player().qualityLevels();
    for (var i = 0; i < levels.length; i++) {
      if (selected.index == levels.length) {
        // If this is the Auto option, enable all renditions for adaptive selection
        levels[i].enabled = true;
      } else if (selected.index == i) {
        levels[i].enabled = true;
      } else {
        levels[i].enabled = false;
      }
    }
  };

  SourceMenuItem.prototype.update = function update() {
    var levels = this.player().qualityLevels();
    var selection = levels.selectedIndex;
    this.selected(this.options_.index == selection);
    this.selected_ = this.options_.index === selection;
  };

  return SourceMenuItem;
}(MenuItem);

var MenuButton = videojs.getComponent('MenuButton');

var SourceMenuButton = function (_MenuButton) {
  inherits(SourceMenuButton, _MenuButton);

  function SourceMenuButton(player, options) {
    classCallCheck(this, SourceMenuButton);

    var _this = possibleConstructorReturn(this, _MenuButton.call(this, player, options));

    MenuButton.apply(_this, arguments);

    var qualityLevels = _this.player().qualityLevels();

    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options.default) {
      if (options.default == 'low') {
        for (var i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = i == 0;
        }
      } else if (options.default = 'high') {
        for (var i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = i == qualityLevels.length - 1;
        }
      }
    }

    // Bind update to qualityLevels changes
    //this.player().qualityLevels.on(['change', 'addqualitylevel'], videojs.bind( this, this.update) );
    return _this;
  }

  SourceMenuButton.prototype.createEl = function createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  };

  SourceMenuButton.prototype.buildCSSClass = function buildCSSClass() {
    return MenuButton.prototype.buildCSSClass.call(this) + ' vjs-icon-cog';
  };

  SourceMenuButton.prototype.update = function update() {
    return MenuButton.prototype.update.call(this);
  };

  SourceMenuButton.prototype.createItems = function createItems() {
    var menuItems = [];
    var levels = this.player().qualityLevels();
    var labels = [];

    for (var i = 0; i < levels.length; i++) {
      var index = levels.length - (i + 1);
      var selected = index === levels.selectedIndex;

      // Display height if height metadata is provided with the stream, else use bitrate
      var label = '' + index;
      var sortVal = index;
      if (levels[index].height) {
        label = levels[index].height + 'p';
        sortVal = parseInt(levels[index].height, 10);
      } else if (levels[index].bitrate) {
        label = Math.floor(levels[index].bitrate / 1e3) + ' kbps';
        sortVal = parseInt(levels[index].bitrate, 10);
      }

      // Skip duplicate labels
      if (labels.indexOf(label) >= 0) {
        continue;
      }
      labels.push(label);

      menuItems.push(new SourceMenuItem(this.player_, { label: label, index: index, selected: selected, sortVal: sortVal }));
    }

    // If there are multiple quality levels, offer an 'auto' option
    if (levels.length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, { label: 'Auto', index: levels.length, selected: false, sortVal: 99999 }));
    }

    // Sort menu items by their label name with Auto always first
    menuItems.sort(function (a, b) {
      if (a.options_.sortVal < b.options_.sortVal) {
        return 1;
      } else if (a.options_.sortVal > b.options_.sortVal) {
        return -1;
      } else {
        return 0;
      }
    });

    return menuItems;
  };

  return SourceMenuButton;
}(MenuButton);

// Default options for the plugin.
var defaults = {};

// Cross-compatibility for Video.js 5 and 6.
var registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
* Function to invoke when the player is ready.
*
* This is a great place for your plugin to initialize itself. When this
* function is called, the player will have its DOM and child components
* in place.
*
* @function onPlayerReady
* @param    {Player} player
*           A Video.js player object.
*
* @param    {Object} [options={}]
*           A plain object containing options for the plugin.
*/
var onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-http-source-selector');
  console.log("videojs-http-source-selector initialized!");

  console.log("player.techName_:" + player.techName_);
  //This plugin only supports level selection for HLS playback
  if (player.techName_ != 'Html5') {
    return false;
  }

  /**
  *
  * We have to wait for the manifest to load before we can scan renditions for resolutions/bitrates to populate selections
  *
  **/
  player.on(['loadedmetadata'], function (e) {
    var qualityLevels = player.qualityLevels();
    videojs.log('loadmetadata event');
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (player.videojs_http_source_selector_initialized == 'undefined' || player.videojs_http_source_selector_initialized == true) {
      console.log("player.videojs_http_source_selector_initialized == true");
    } else {
      console.log("player.videojs_http_source_selector_initialized == false");
      player.videojs_http_source_selector_initialized = true;
      var controlBar = player.controlBar,
          fullscreenToggle = controlBar.getChild('fullscreenToggle').el();
      controlBar.el().insertBefore(controlBar.addChild('SourceMenuButton').el(), fullscreenToggle);
    }
  });
};

/**
* A video.js plugin.
*
* In the plugin function, the value of `this` is a video.js `Player`
* instance. You cannot rely on the player being in a "ready" state here,
* depending on how the plugin is invoked. This may or may not be important
* to you; if not, remove the wait for "ready"!
*
* @function httpSourceSelector
* @param    {Object} [options={}]
*           An object of options left to the plugin author to define.
*/
var httpSourceSelector = function httpSourceSelector(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, videojs.mergeOptions(defaults, options));
    //this.getChild('controlBar').addChild('SourceMenuButton', {});
  });

  videojs.registerComponent('SourceMenuButton', SourceMenuButton);
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

// Include the version number.
httpSourceSelector.VERSION = version;

module.exports = httpSourceSelector;
