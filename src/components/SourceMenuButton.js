import SourceMenuItem from './SourceMenuItem';

const MenuButton = videojs.getComponent('MenuButton');

class SourceMenuButton extends MenuButton
{
  constructor(player, options) {
    super(player, options);

    MenuButton.apply(this, arguments);

    var qualityLevels = this.player().qualityLevels();

    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options.default) {
      if (options.default == 'low') {
        for (var i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = (i == 0);
        }
      } else if (options.default = 'high') {
        for (var i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = (i == (qualityLevels.length - 1));
        }
      }
    }

    // Bind update to qualityLevels changes
    //this.player().qualityLevels.on(['change', 'addqualitylevel'], videojs.bind( this, this.update) );
  };

  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  }

  buildCSSClass() {
    return MenuButton.prototype.buildCSSClass.call( this ) + ' vjs-icon-cog';
  }

  update() {
    return MenuButton.prototype.update.call(this);
  }

  createItems() {
    var menuItems = [];
    var levels = this.player().qualityLevels();

    for (var i = 0; i < levels.length; i++) {
      var index = levels.length - (i + 1);
      var selected = (index === levels.selectedIndex);

      // Display height if height metadata is provided with the stream, else use bitrate
      var label = `${index}`;
      if (levels[index].height) {
        label = `${levels[index].height}p`;
      } else if (levels[index].bitrate) {
        label = `${Math.floor(levels[index].bitrate / 1e3)} kbps`;
      }

      menuItems.push(new SourceMenuItem(this.player_, {label, index, selected}));
    }

    // If there are multiple quality levels, offer an 'auto' option
    if (levels.length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, { label: 'Auto', index: levels.length, selected: false }));
    }

    return menuItems;
  }
}

export default SourceMenuButton;
