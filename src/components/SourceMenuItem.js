import videojs from 'video.js';
const MenuItem = videojs.getComponent('MenuItem');

class SourceMenuItem extends MenuItem
{
  constructor(player, options) {
    super(player, options);
    options.selectable = true;
  }

  handleClick() {
    var selected = this.options_;
    console.log("Changing quality to:", selected.label);

    this.selected_ = true;
    this.selected(true);

    var levels = this.player().qualityLevels();
    for(var i = 0; i < levels.length; i++) {
      if (selected.index == levels.length) {
        // If this is the Auto option, enable all renditions for adaptive selection
        levels[i].enabled = true;
      } else if (selected.index == i) {
        levels[i].enabled = true;
      } else {
        levels[i].enabled = false;
      }
    }
  }

  update() {
    var levels = this.player().qualityLevels();
    var selection = levels.selectedIndex;
    this.selected(this.options_.index == selection);
    this.selected_ = (this.options_.index === selection);
  }
}

export default SourceMenuItem;
