import videojs from 'video.js';

var version = "1.1.4";

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

    _this.selectable = true;
    _this.update();
    return _this;
  }

  SourceMenuItem.prototype.handleClick = function handleClick() {
    var levels = this.player().qualityLevels();
    for (var i = 0; i < levels.length; i++) {
      if (this.options_.index === i) {
        levels[i].enabled = true;
      } else {
        levels[i].enabled = false;
      }
    }

    this.options_.controller.triggerItemUpdate();
  };

  SourceMenuItem.prototype.update = function update() {
    var levels = this.player().qualityLevels();
    this.selected(levels[this.options_.index].enabled);
  };

  return SourceMenuItem;
}(MenuItem);

var MenuButton = videojs.getComponent('MenuButton');

var SourceMenuButton = function (_MenuButton) {
  inherits(SourceMenuButton, _MenuButton);

  function SourceMenuButton(player, options) {
    classCallCheck(this, SourceMenuButton);

    var _this = possibleConstructorReturn(this, _MenuButton.call(this, player, options));

    console.log('apply args');
    MenuButton.apply(_this, arguments);

    var levels = _this.player().qualityLevels();
    console.log(' get qualities', _this.qualityLevels);
    //Handle options: We accept an options.default value of ( high || low )
    //This determines a bias to set initial resolution selection.
    if (options && options.default) {
      if (options.default === 'low') {
        levels.forEach(function (level, i) {
          level.enabled = i === 0;
        });
      } else if (options.default === 'high') {
        levels.forEach(function (level, i) {
          level.enabled = levels.length - 1 === 0;
        });
      }
    }
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

  SourceMenuButton.prototype.triggerItemUpdate = function triggerItemUpdate() {
    this.menuItems.forEach(function (item) {
      return item.update();
    });
  };

  SourceMenuButton.prototype.createItems = function createItems() {
    var levels = this.player().qualityLevels();
    this.menuItems = [];

    for (var i = 0; i < levels.length; i++) {
      var index = i;

      var sortVal = index;
      if (levels[index].sortVal) {
        sortVal = parseInt(levels[index].sortVal, 10);
      } else if (levels[index].height) {
        sortVal = parseInt(levels[index].height, 10);
      } else if (levels[index].bitrate) {
        sortVal = parseInt(levels[index].bitrate, 10);
      }

      this.menuItems.push(new SourceMenuItem(this.player_, {
        index: index,
        sortVal: sortVal,
        controller: this,
        label: levels[index].id
      }));
    }

    //Sort menu items by their label name with Auto always first
    this.menuItems.sort(function (a, b) {
      if (a.options_.sortVal < b.options_.sortVal) {
        return 1;
      }if (a.options_.sortVal > b.options_.sortVal) {
        return -1;
      }
      return 0;
    });
    return this.menuItems;
  };

  return SourceMenuButton;
}(MenuButton);

//Default options for the plugin.
var defaults = {};

//Cross-compatibility for Video.js 5 and 6.
var registerPlugin = videojs.registerPlugin || videojs.plugin;
//const dom = videojs.dom || videojs;

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
  //This plugin only supports level selection for HLS playback
  if (player.techName_ !== 'Html5') {
    return false;
  }

  /**
  *
  * We have to wait for the manifest to load before we can scan renditions for resolutions/bitrates to populate selections
  *
  **/
  player.on(['loadedmetadata'], function (e) {
    //hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (player.videojs_http_source_selector_initialized !== 'undefined' && player.videojs_http_source_selector_initialized !== true) {
      player.videojs_http_source_selector_initialized = true;
      var controlBar = player.controlBar;

      var fullscreenToggle = controlBar.getChild('fullscreenToggle').el();
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

//Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

//Include the version number.
httpSourceSelector.VERSION = version;

export default httpSourceSelector;
