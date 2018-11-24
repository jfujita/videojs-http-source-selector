import videojs from 'video.js';

var version = "1.0.1";

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
    //var qualityLevels = this.player().qualityLevels();

    //qualityLevels.on('change', videojs.bind(this, this.update));
    //this.player.on('resolutionchange', videojs.bind(this, this.update));
    return _this;
  }

  SourceMenuItem.prototype.handleClick = function handleClick() {
    console.log("Change quality to " + this.options_.label);
    console.log("qualityLevels: ");
    console.log(this.player().qualityLevels());
    this.selected_ = true;
    this.selected(true);
    for (var i = 0; i < this.player().qualityLevels().length; i++) {
      //If this is the Auto option, enable all renditions for adaptive selection
      if (this.options_.index == this.player().qualityLevels().length) {
        this.player().qualityLevels()[i].enabled = true;
      } else if (i == this.options_.index) {
        this.player().qualityLevels()[i].enabled = true;
      } else {
        this.player().qualityLevels()[i].enabled = false;
      }
    }
  };

  SourceMenuItem.prototype.update = function update() {
    var selection = this.player().qualityLevels().selectedIndex;
    console.log(this.options_.index + " == " + selection);
    console.log("menuItem.index === qualityLevels().selectedIndex");
    this.selected(this.options_.index == selection);
    this.selected_ = this.options_.index === selection;
  };

  return SourceMenuItem;
}(MenuItem);

var MenuButton = videojs.getComponent('MenuButton');

// The videojs.extend function is used to assist with inheritance. In
// an ES6 environment, `class SourceButton extends MenuButton` would work
// identically.

var SourceMenuButton = function (_MenuButton) {
  inherits(SourceMenuButton, _MenuButton);

  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  function SourceMenuButton(player, options) {
    classCallCheck(this, SourceMenuButton);

    var _this = possibleConstructorReturn(this, _MenuButton.call(this, player, options));
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!


    MenuButton.apply(_this, arguments);
    var qualityLevels = _this.player().qualityLevels();
    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options.default) {
      console.log("options.default: " + options.default);
      console.log("this.player().qualityLevels(): ");
      console.log(_this.player().qualityLevels());
      console.log("this.player().qualityLevels().length: ");
      console.log(_this.player().qualityLevels().length);
      if (options.default == 'low') {
        for (var i = 0; i < _this.player().qualityLevels().length; i++) {
          if (i == 0) {
            _this.player().qualityLevels()[i].enabled = true;
          } else {
            _this.player().qualityLevels()[i].enabled = false;
          }
        }
      } else if (options.default = 'high') {
        for (var i = 0; i < _this.player().qualityLevels().length; i++) {
          if (i == _this.player().qualityLevels().length - 1) {
            _this.player().qualityLevels()[i].enabled = true;
          } else {
            _this.player().qualityLevels()[i].enabled = false;
          }
        }
      }
    }
    // Bind update to qualityLevels changes
    //qualityLevels.on(['change', 'addqualitylevel'], videojs.bind( this, this.update) );
    return _this;
  }

  // The `createEl` function of a component creates its DOM element.
  SourceMenuButton.prototype.createEl = function createEl() {
    return videojs.dom.createEl('div', {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
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
    var labels = this.player.qualityLevels || {};

    for (var i = 0; i < this.player().qualityLevels().length; i++) {
      var j = this.player().qualityLevels().length - (i + 1);

      //console.log(this.player().qualityLevels()[j].id);
      //console.log(this.player().qualityLevels()[j]);
      var label = "" + j;
      //Display height if height metadata is provided with the stream, else use bitrate
      if (this.player().qualityLevels()[j].height) {
        label = this.player().qualityLevels()[j].height;
      } else if (this.player().qualityLevels()[j].bitrate) {
        label = Math.floor(this.player().qualityLevels()[j].bitrate / 1e3) + ' kbps';
      }

      menuItems.push(new SourceMenuItem(this.player_, {
        label: label,
        index: j,
        selected: j === (this.player().qualityLevels().selectedIndex ? label : false)
      }));
    }
    //If there are more than one quality levels, offer an 'auto' option
    if (this.player().qualityLevels().length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, {
        label: 'Auto',
        index: this.player().qualityLevels().length,
        selected: false
      }));
    }
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
    videojs.log('loadmeadata event');
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (player.videojs_http_source_selector_initialized == 'undefined' || player.videojs_http_source_selector_initialized == true) {
      console.log("player.videojs_http_source_selector_initialized == true");
    } else {
      console.log("player.videojs_http_source_selector_initialized == false");
      player.videojs_http_source_selector_initialized = true;
      player.getChild('controlBar').addChild('SourceMenuButton', {});
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

export default httpSourceSelector;
