import SourceMenuItem from './SourceMenuItem';

const MenuButton = videojs.getComponent('MenuButton');

// The videojs.extend function is used to assist with inheritance. In
// an ES6 environment, `class SourceButton extends MenuButton` would work
// identically.
class SourceMenuButton extends MenuButton
{
  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  constructor(player, options)
  {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);
    MenuButton.apply(this, arguments);
    var qualityLevels = player.qualityLevels();
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
  };

  // The `createEl` function of a component creates its DOM element.
  createEl()
  {
    return videojs.dom.createEl('div',
    {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  }

  buildCSSClass()
  {
    return MenuButton.prototype.buildCSSClass.call( this ) + ' vjs-icon-cog';
  }

  update()
  {
    return MenuButton.prototype.update.call(this);
  }

  createItems()
  {
    var menuItems = [];
    var labels = (player.qualityLevels) || {};

    for(var i = 0; i < player.qualityLevels().length; i++)
    {
      var j = player.qualityLevels().length - (i + 1);

      //console.log(player.qualityLevels()[j].id);
      //console.log(player.qualityLevels()[j]);
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
  }
}
export default SourceMenuButton;
