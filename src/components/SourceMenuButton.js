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
    var qualityLevels = this.player().qualityLevels();
    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if(options && options.default)
    {
      console.log("options.default: "+options.default);
      console.log("this.player().qualityLevels(): ");
      console.log(this.player().qualityLevels());
      console.log("this.player().qualityLevels().length: ");
      console.log(this.player().qualityLevels().length);
      if(options.default == 'low')
      {
        for(var i = 0; i < this.player().qualityLevels().length; i++)
        {
          if(i == 0)
          {
            this.player().qualityLevels()[i].enabled = true;

          }
          else
          {
            this.player().qualityLevels()[i].enabled = false;

          }
        }
      }
      else if(options.default = 'high')
      {
        for(var i = 0; i < this.player().qualityLevels().length; i++)
        {
          if(i == this.player().qualityLevels().length - 1)
          {
            this.player().qualityLevels()[i].enabled = true;

          }
          else
          {
            this.player().qualityLevels()[i].enabled = false;

          }
        }
      }
    }
    // Bind update to qualityLevels changes
    //qualityLevels.on(['change', 'addqualitylevel'], videojs.bind( this, this.update) );
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
    var labels = (this.player.qualityLevels) || {};

    for(var i = 0; i < this.player().qualityLevels().length; i++)
    {
      var j = this.player().qualityLevels().length - (i + 1);

      //console.log(this.player().qualityLevels()[j].id);
      //console.log(this.player().qualityLevels()[j]);
      var label = ""+j;
      //Attempt to display label, height, and then bitrate metadata if provided
      if(this.player().qualityLevels()[j].label)
      {
        label = this.player().qualityLevels()[j].label;
      } else if(this.player().qualityLevels()[j].height)
      {
        label = this.player().qualityLevels()[j].height;
      }
      else if(this.player().qualityLevels()[j].bitrate)
      {
        label = Math.floor(this.player().qualityLevels()[j].bitrate / 1e3)+' kbps';
      }

      menuItems.push(new SourceMenuItem(
        this.player_,
        {
          label:label,
          index: j,
          selected: j === (this.player().qualityLevels().selectedIndex ? label : false)
        })
      );
    }
    //If there are more than one quality levels, offer an 'auto' option
    if(this.player().qualityLevels().length > 1)
    {
      menuItems.push(new SourceMenuItem(
        this.player_,
        {
          label:'Auto',
          index:this.player().qualityLevels().length,
          selected: false
        })
      );
    }
    return menuItems;
  }
}
export default SourceMenuButton;
