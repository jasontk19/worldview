/* eslint-disable */

export default {
  /*
  * @func dataLayerPush object to GoogleTagManager
  * can add custom javascript object that can be retrieved as custom data layer variables
  * @static
  *
  * @param EventObject {object}
  *
  * @return {void}
  */
  pushEvent(eventObject) {
    if (typeof (dataLayer) !== 'undefined') {
      window.dataLayer.push(eventObject);
    }
  },
};
