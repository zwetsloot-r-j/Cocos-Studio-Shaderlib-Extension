ccssl.SelectShaderButton = ccssl.ToggleButton.extend({
  DEFAULT_CSS: {
    bg: {
      normal: "menu-item-bg margin",
      selected: "menu-item-bg-selected margin"
    },
    content: {
      font: "menu-item-font",
      normal: "menu-item",
      selected: "menu-item-selected"
    }
  },

  init: function() {
    this.base.init.apply(this, ["Select Shader", 50]);

    this.addOnSelectEventListener(this._onSelectShaderButton, this);
    this.addOnDeselectEventListener(this._onDeselectShaderButton, this);

    var rect = this.getElement().getBoundingClientRect();
    this._selectShaderMenu = new ccssl.SelectShaderMenu().init({x: rect.left, y: rect.top + rect.height}, {width: rect.width, height: 50});
    this._selectShaderMenu.addOnSelectShaderEventListener(this._onSelectShader, this);
    this._selectShaderMenu.hide();

    return this;
  },

  setParent: function(parent) {
    this._parent = parent;
  },

  redraw: function() {
    var rect = this.getElement().getBoundingClientRect();
    this._selectShaderMenu.setItemRect({x: rect.left, y: rect.top + rect.height, width: rect.width, height: 50});
    this._selectShaderMenu.redraw();
  },

  _onSelectShaderButton: function() {
    this._selectShaderMenu.show();
  },

  _onDeselectShaderButton: function() {
    this._selectShaderMenu.hide();
  },

  _onSelectShader: function(shaderName) {
    this.setTitle(shaderName);
    this.deselect();
  }
});