ccssl.MaterialButtonsInterface.SelectButton = ccssl.ToggleButton.extend({
  init: function(material, buttonInterface) {
    ccssl.ToggleButton.prototype.init.call(this, material.name, 50);
    this._material = material;
    this._buttonInterface = buttonInterface;
    this.addOnSelectEventListener(this._onSelectMaterial, this);
    this.addOnDeselectEventListener(this._onDeselectMaterial, this);

    return this;
  },

  setSize: function(size) {
    ccssl.MaterialButtonsInterface.ButtonBase.prototype.setSize.apply(this, arguments);
  },

  _onSelectMaterial: function() {
    ccssl.nodeSelection.get(function(currentSelection) {
      ccssl.messageDispatcher.postMessage({
        message: "applyMaterial",
        material: this._material,
        selection: currentSelection
      });
    }.bind(this), "currentSelection");
  },

  _onDeselectMaterial: function() {

  }
});