import videojs from 'video.js';
import SourceMenuItem from './SourceMenuItem';

const MenuButton = videojs.getComponent('MenuButton');

class SourceMenuButton extends MenuButton {
  constructor(player, options) {
    super(player, options);

    const levels = this.player().qualityLevels();
    //Handle options: We accept an options.default value of ( high || low )
    //This determines a bias to set initial resolution selection.
    if(options && options.default) {
      if(options.default === 'low') {
        levels.forEach((level, i) => {
          level.enabled = (i === 0);
        });
      } else if(options.default === 'high') {
        levels.forEach((level, i) => {
          level.enabled = ((levels.length - 1) === 0);
        });
      }
    }
  }

  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button',
    });
  }

  buildCSSClass() {
    return `${MenuButton.prototype.buildCSSClass.call(this)} vjs-icon-cog`;
  }

  triggerItemUpdate() {
    this.menuItems.forEach(item => item.update());
  }

  createItems() {
    const levels = this.player().qualityLevels();
    this.menuItems = [];

    for(let i = 0; i < levels.length; i++) {
      const index = i;

      let sortVal = index;
      if(levels[index].sortVal) {
        sortVal = parseInt(levels[index].sortVal, 10);
      } else if(levels[index].height) {
        sortVal = parseInt(levels[index].height, 10);
      } else if(levels[index].bitrate) {
        sortVal = parseInt(levels[index].bitrate, 10);
      }

      this.menuItems.push(new SourceMenuItem(this.player_, {
        index,
        sortVal,
        controller: this,
        label: levels[index].id,
      }));
    }

    //Sort menu items by their label name with Auto always first
    this.menuItems.sort((a, b) => {
      if(a.options_.sortVal < b.options_.sortVal) {
        return 1;
      } if(a.options_.sortVal > b.options_.sortVal) {
        return -1;
      }
      return 0;
    });
    return this.menuItems;
  }
}

export default SourceMenuButton;
