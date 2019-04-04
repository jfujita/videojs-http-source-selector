import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');

class SourceMenuItem extends MenuItem {
  constructor(player, options) {
    super(player, options);
    this.selectable = true;
    this.update();
  }

  handleClick() {
    const levels = this.player().qualityLevels();
    for(let i = 0; i < levels.length; i++) {
      if(this.options_.index === i) {
        levels[i].enabled = true;
      } else {
        levels[i].enabled = false;
      }
    }

    this.options_.controller.triggerItemUpdate();
  }

  update() {
    const levels = this.player().qualityLevels();
    this.selected(levels[this.options_.index].enabled);
  }
}

export default SourceMenuItem;
