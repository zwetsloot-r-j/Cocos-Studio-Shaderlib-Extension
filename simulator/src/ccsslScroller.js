ccssl.Scroller = ccui.ScrollView.extend({

  /**
   * 固定しない場合に使う設定
   *
   * @property DEFAULT_VALUES
   * @readOnly
   */
  DEFAULT_VALUES: {
    DIRECTION: ccui.ScrollView.DIR_BOTH,
    DISTANCE_BEFORE_OVERRIDE_CHILD: 50,
    INERTIA_SCROLL_ENABLED: true
  },

  /**
   * 子供のイベントを代わりに受け取り時に使うメソッドリスト
   *
   * @property ON_TOUCH_EVENT_INTERCEPTORS
   * @readOnly
   */
  ON_TOUCH_EVENT_INTERCEPTORS: function(interceptors) {
    interceptors[ccui.Widget.TOUCH_BEGAN] = "_interceptOnTouchBegan";
    interceptors[ccui.Widget.TOUCH_MOVED] = "_interceptOnTouchMoved";
    interceptors[ccui.Widget.TOUCH_ENDED] = "_interceptOnTouchEnded";
    interceptors[ccui.Widget.TOUCH_CANCELED] = "_interceptOnTouchCancelled";

    return interceptors;
  }({}),

  /**
   * スクロールビューの初期化
   *
   * @method initialize
   * @param {cc.Size} size
   * @returns {ccssl.Scroller}
   */
  initialize: function(size) {
    this._distanceBeforeOverrideChild = this.DEFAULT_VALUES.DISTANCE_BEFORE_OVERRIDE_CHILD;
    this._overrideChild = false;

    this.direction = this.DEFAULT_VALUES.DIRECTION;

    this.setInertiaScrollEnabled(this.DEFAULT_VALUES.INERTIA_SCROLL_ENABLED);

    this.setTouchEnabled(true);

    this._size = size;

    return this;
  },


  /**
   * cc.NodeがaddChildされる時に呼ばれるメソッドです。
   *
   * @method onEnter
   * @returns {boolean}
   */
  onEnter: function() {
    ccui.ScrollView.prototype.onEnter.call(this);
    this.setSize(this._size);

    this.getInnerContainer().setTouchEnabled(true);
    this.getInnerContainer().setPropagateTouchEvents(true);

    return true;
  },

  addChild: function(child) {
    ccui.ScrollView.prototype.addChild.apply(this, arguments);
    var max = cc.p(child.x + (1 - child.anchorX) * child.width, child.y + (1 - child.anchorY) * child.height);
    var min = cc.p(child.x - child.anchorX * child.width, child.y - child.anchorY - child.height);
    var loopChildren = function(node, posRelativeToScrollContainer) {
      node.getChildren().forEach(function(_child) {
        var _posRelativeToScrollContainer = cc.p(posRelativeToScrollContainer.x + _child.x, posRelativeToScrollContainer.y + _child.y);
        max.x = Math.max(max.x, _posRelativeToScrollContainer.x + (1 - _child.anchorX) * _child.width);
        max.y = Math.max(max.y, _posRelativeToScrollContainer.y + (1 - _child.anchorY) * _child.height);
        min.x = Math.min(min.x, _posRelativeToScrollContainer.x - _child.anchorX * _child.width);
        min.y = Math.min(min.y, _posRelativeToScrollContainer.y - _child.anchorY * _child.height);
        loopChildren(_child, _posRelativeToScrollContainer);
      })
    };
    loopChildren(child, child.getPosition());
    var container = this.getInnerContainer();
    container.width = Math.max(container.x + container.width, max.x) - Math.min(container.x, min.x);
    container.height = Math.max(container.y + container.height, max.y) - Math.min(container.y, min.y);
    child.x = -min.x;
    child.y = -min.y;
    console.log(-min.x);
    console.log(-min.y);
  },

  /**
   * 子供からイベントを受け取る時に子供のイベントを無視するまでのスクロール幅（pixel）
   *
   * @method setDistanceBeforeOverrideChild
   * @param distance
   */
  setDistanceBeforeOverrideChild: function(distance) {
    this._distanceBeforeOverrideChild = distance;
  },

  /**
   * 子供から受け取ったイベントがここに入ってくる
   * 自分で呼ぶ必要がありません
   *
   * @method interceptTouchEvent
   * @param type
   * @param sender
   * @param touch
   */
  interceptTouchEvent: function(type, sender, touch) {
    console.debug("INTERCEPTING");
    if (this.ON_TOUCH_EVENT_INTERCEPTORS[type] == null) {
      return;
    }
    this[this.ON_TOUCH_EVENT_INTERCEPTORS[type]](sender, touch);
  },

  /**
   * cocos2dのtouchEventコールバック
   * touchEventを登録する場合はaddTouchEventListenerを使って下さい
   *
   * @method onTouchBegan
   * @param touch
   * @param event
   * @returns {boolean}
   */
  onTouchBegan: function(touch, event) {
    console.debug("touch began started");
    if (!ccui.ScrollView.prototype.onTouchBegan.apply(this, arguments)) {
      return false;
    }
    console.debug("TOUCH EVENT PROCCED");
    this._touchStartingPoint = touch.getLocation();
    return true;
  },

  //子供から受け取ったTouchBeganイベント
  _interceptOnTouchBegan: function(sender, touch) {
    console.debug("TOUCH START INTERCEPTED");
    this.onTouchBegan(touch, ccui.Widget.TOUCH_BEGAN);
  },

  //子供から受け取ったTouchMovedイベント
  _interceptOnTouchMoved: function(sender, touch) {
    console.debug("TOUCH MOVED INTERCEPTED");
    var diff = Math.abs(this._touchStartingPoint.x - touch.getLocation().x) + Math.abs(this._touchStartingPoint.y - touch.getLocation().y);
    if (this._overrideChild || diff > this._distanceBeforeOverrideChild) {
      sender.setHighlighted(false);
      this._overrideChild = true;
      this.onTouchMoved(touch, ccui.Widget.TOUCH_MOVED);
    }
  },

  //子供から受け取ったTouchEndedイベント
  _interceptOnTouchEnded: function(sender, touch) {
    console.debug("TOUCH ENDED INTERCEPTED");
    this._overrideChild = false;
    this.onTouchEnded(touch, ccui.Widget.TOUCH_ENDED);
  },

  //子供から受け取ったTouchCancelledイベント
  _interceptOnTouchCancelled: function(sender, touch) {
    console.debug("TOUCH CANCELED INTERCEPTED");
    this._overrideChild = false;
    this.onTouchCancelled(touch, ccui.Widget.TOUCH_CANCELED);
  }
});