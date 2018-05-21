module.exports = function(videojs)
{
  var MenuItem = videojs.getComponent('MenuItem');
  var SourceMenuItem = videojs.extend(MenuItem,
  {
    constructor: function(player, options)
    {
      options.selectable = true;
      // Sets this.player_, this.options_ and initializes the component
      MenuItem.call(this, player, options);
      //this.selected = options.selected;

      //qualityLevels.on('change', videojs.bind(this, this.update));
      player.on('resolutionchange', videojs.bind(this, this.update));
    },

    handleClick: function(event)
    {
      MenuItem.prototype.handleClick.call(this,event);
      //this.player_.currentResolution(this.options_.label);
      console.log("Change quality to "+this.options_.label);
      console.log("qualityLevels: ");
      console.log(player.qualityLevels());
      this.selected_=true;
      this.selected(true);
      for(var i = 0; i < player.qualityLevels().length; i++)
      {
        //If this is the Auto option, enable all renditions for adaptive selection
        if(this.options_.index == player.qualityLevels().length)
        {
          player.qualityLevels()[i].enabled = true;
        }
        else if(i == this.options_.index)
        {
          player.qualityLevels()[i].enabled = true;
        }
        else
        {
          player.qualityLevels()[i].enabled = false;
        }
      }
    },

    update: function()
    {
      var selection = player.qualityLevels().selectedIndex;
      console.log(this.options_.index+" == "+selection);
      console.log("menuItem.index === qualityLevels().selectedIndex");
      this.selected(this.options_.index == selection);
      this.selected_ = (this.options_.index === selection);
    }
  });
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);

  return SourceMenuItem;
}
