import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
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
const onPlayerReady = (player, options) =>
{
  player.addClass('vjs-http-source-selector');
  console.log("videojs-http-source-selector initialized!");

  var qualityLevels = player.qualityLevels();
  console.log("player.techName_:"+player.techName_);
  //This plugin only supports level selection for HLS playback
  if(player.techName_ != 'Html5')
  {
    return false;
  }

  /**
  *
  * We have to wait for the manifest to load before we can scan renditions for resolutions/bitrates to populate selections
  *
  **/
  player.on(['loadedmetadata'], function(e)
  {
    videojs.log('loadmeadata event');
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if(player.videojs_http_source_selector_initialized == 'undefined' || player.videojs_http_source_selector_initialized == true)
    {
      console.log("player.videojs_http_source_selector_initialized == true");
      return;
    }
    else
    {
      console.log("player.videojs_http_source_selector_initialized == false")
      player.videojs_http_source_selector_initialized = true;
    }





    /**
    *
    * Render menu visual elements:
    *
    **/
    //Resolution/bitrate menu items
    var MenuItem = videojs.getComponent('MenuItem');
    var SourceMenuItem = videojs.extend(MenuItem,
    {
      constructor: function(player, options)
      {
        options.selectable = true;
        // Sets this.player_, this.options_ and initializes the component
        MenuItem.call(this, player, options);
        //this.selected = options.selected;

        qualityLevels.on('change', videojs.bind(this, this.update));
        player.on('resolutionchange', videojs.bind(this, this.update));
      }
    });

    //Resolution/bitrate menu item click/update handler functions
    SourceMenuItem.prototype.handleClick = function(event)
    {
      MenuItem.prototype.handleClick.call(this,event);
      //this.player_.currentResolution(this.options_.label);
      console.log("Change quality to "+this.options_.label);
      console.log("qualityLevels: ");
      console.log(this.player_.qualityLevels());
      this.selected_=true;
      this.selected(true);
      for(var i = 0; i < this.player_.qualityLevels().length; i++)
      {
        //If this is the Auto option, enable all renditions for adaptive selection
        if(this.options_.index == this.player_.qualityLevels().length)
        {
          this.player_.qualityLevels()[i].enabled = true;
        }
        else if(i == this.options_.index)
        {
          this.player_.qualityLevels()[i].enabled = true;
        }
        else
        {
          this.player_.qualityLevels()[i].enabled = false;
        }
      }
    };
    SourceMenuItem.prototype.update = function()
    {
      var selection = this.player_.qualityLevels().selectedIndex;
      console.log(this.options_.index+" == "+selection);
      console.log("menuItem.index === qualityLevels().selectedIndex");
      this.selected(this.options_.index == selection);
      this.selected_ = (this.options_.index === selection);
    };
    videojs.registerComponent('SourceMenuItem', SourceMenuItem);













    // Get the MenuButton base class from Video.js
    var MenuButton = videojs.getComponent('MenuButton');
    // The videojs.extend function is used to assist with inheritance. In
    // an ES6 environment, `class SourceButton extends MenuButton` would work
    // identically.
    var SourceButton = videojs.extend(MenuButton,
    {
      // The constructor of a component receives two arguments: the
      // player it will be associated with and an object of options.
      constructor: function(player, options)
      {
        // It is important to invoke the superclass before anything else,
        // to get all the features of components out of the box!
        MenuButton.apply(this, arguments);
        // Handle options: We accept an options.default value of ( high || low )
        // This determines a bias to set initial resolution selection.
        if(options && options.default)
        {
          console.log("options.default: "+options.default);
          console.log("player.qualityLevels(): ");
          console.log(player.qualityLevels());
          console.log("player.qualityLevels().length: ");
          console.log(player.qualityLevels().length);
          if(options.default == 'low')
          {
            for(var i = 0; i < player.qualityLevels().length; i++)
            {
              if(i == 0)
              {
                player.qualityLevels()[i].enabled = true;

              }
              else
              {
                player.qualityLevels()[i].enabled = false;

              }
            }
          }
          else if(options.default = 'high')
          {
            for(var i = 0; i < player.qualityLevels().length; i++)
            {
              if(i == player.qualityLevels().length - 1)
              {
                player.qualityLevels()[i].enabled = true;

              }
              else
              {
                player.qualityLevels()[i].enabled = false;

              }
            }
          }
        }
        // Bind update to qualityLevels changes
        qualityLevels.on(['change', 'addqualitylevel'], videojs.bind( this, this.update) );
      },

      // The `createEl` function of a component creates its DOM element.
      createEl: function()
      {
        return videojs.createEl('div',
        {
          // Prefixing classes of elements within a player with "vjs-"
          // is a convention used in Video.js.
          className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
        });
      },

      buildCSSClass: function()
      {
        return MenuButton.prototype.buildCSSClass.call( this ) + ' vjs-icon-cog';
      }
    });

    SourceButton.prototype.update = function()
    {
      return MenuButton.prototype.update.call(this);
    };

    //Populate menu with resolution/bitrate options
    SourceButton.prototype.createItems = function()
    {
      var menuItems = [];
      var labels = (player.qualityLevels) || {};

      for(var i = 0; i < player.qualityLevels().length; i++)
      {
        var j = player.qualityLevels().length - (i + 1);

        console.log(player.qualityLevels()[j].id);
        console.log(player.qualityLevels()[j]);
        var label = ""+j;
        //Display height if height metadata is provided with the stream, else use bitrate
        if(player.qualityLevels()[j].height)
        {
          label = player.qualityLevels()[j].height;
        }
        else if(player.qualityLevels()[j].bitrate)
        {
          label = Math.floor(player.qualityLevels()[j].bitrate / 1e3)+' kbps';
        }

        menuItems.push(new SourceMenuItem(
          this.player_,
          {
            label:label,
            index: j,
            selected: j === (player.qualityLevels.selectedIndex ? label : false)
          })
        );
      }
      //If there are more than one quality levels, offer an 'auto' option
      if(player.qualityLevels().length > 1)
      {
        menuItems.push(new SourceMenuItem(
          this.player_,
          {
            label:'Auto',
            index:player.qualityLevels().length,
            selected: false
          })
        );
      }
      return menuItems;
    };
    videojs.registerComponent('httpSourceButton', SourceButton);








    player.getChild('controlBar').addChild('httpSourceButton', {});
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
  const httpSourceSelector = function(options) {
    this.ready(() => {
      onPlayerReady(this, videojs.mergeOptions(defaults, options));
    });

    this.on('playing', function() {
      videojs.log('WTFWTFWTFWTF');
    });

  };

  // Register the plugin with video.js.
  registerPlugin('httpSourceSelector', httpSourceSelector);

  // Include the version number.
  httpSourceSelector.VERSION = VERSION;

  export default httpSourceSelector;
