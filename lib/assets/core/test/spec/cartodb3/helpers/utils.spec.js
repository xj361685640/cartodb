var Backbone = require('backbone');
var Utils = require('../../../../javascripts/cartodb3/helpers/utils');

describe('helpers/utils', () => {
  describe('isURL', () => {
    it('should check if the string is an url or an ftp', () => {
      expect(Utils.isURL('ftp://jamon.com')).toBeTruthy();
    });

    it("shouldn't check if the string is undefined or null or empty", () => {
      expect(Utils.isURL('')).toBeFalsy();
      expect(Utils.isURL()).toBeFalsy();
      expect(Utils.isURL(undefined)).toBeFalsy();
    });

    it('should be false if the string is a name, for example', () => {
      expect(Utils.isURL('eyeyyeeyyeey')).toBeFalsy();
    });
  });

  describe('isBlank', () => {
    it('should check if the string is blank or not', () => {
      expect(Utils.isBlank('')).toBeTruthy();
      expect(Utils.isBlank('hi!')).toBeFalsy();
      expect(Utils.isBlank('0')).toBeFalsy();
    });
  });

  describe('formatNumber', () => {
    it('should format the number', () => {
      expect(Utils.formatNumber(2000000)).toEqual('2,000,000');
    });

    it("shouldn't format numbers < 1000", () => {
      expect(Utils.formatNumber(99)).toEqual('99');
      expect(Utils.formatNumber(0)).toEqual('0');
    });

    it("shouldn't handle invalid values", () => {
      expect(Utils.formatNumber('Solvitur ambulando')).toEqual('Solvitur ambulando');
      expect(Utils.formatNumber(null)).toEqual('0');
    });
  });

  describe('.result', () => {
    beforeEach(() => {
      this.model = new Backbone.Model({
        something: 'yay'
      });
      this.model.myProp = 123;
    });

    it('should try to call given method', () => {
      expect(Utils.result(this.model, 'get', 'something')).toEqual('yay');
    });

    it('should return the property if a value', () => {
      expect(Utils.result(this.model, 'myProp')).toEqual(123);
    });

    it('should return fallback value if can not call method', () => {
      expect(Utils.result(this.model, 'nonexisting')).toBeUndefined();
      expect(Utils.result(undefined, 'nonexisting')).toBeNull();
    });
  });

  describe('.hexToRGB', () => {
    it('should get RGB color', () => {
      var rgb = Utils.hexToRGB('#FFF');
      expect(rgb.r).toEqual(255);
      expect(rgb.g).toEqual(255);
      expect(rgb.b).toEqual(255);

      rgb = Utils.hexToRGB('#FFFFFF');
      expect(rgb.r).toEqual(255);
      expect(rgb.g).toEqual(255);
      expect(rgb.b).toEqual(255);

      rgb = Utils.hexToRGB('#FF00CC');
      expect(rgb.r).toEqual(255);
      expect(rgb.g).toEqual(0);
      expect(rgb.b).toEqual(204);

      rgb = Utils.hexToRGB('what');
      expect(rgb).toEqual(null);
    });
  });

  describe('.rgbToHex', () => {
    it('should get a rgb string', () => {
      expect(Utils.rgbToHex(0, 0, 0)).toEqual('#000000');
      expect(Utils.rgbToHex(255, 255, 255)).toEqual('#ffffff');
      expect(Utils.rgbToHex(255, 0, 204)).toEqual('#ff00cc');
    });
  });

  describe('.hexToRGBA', () => {
    it('should do it properly', () => {
      expect(Utils.hexToRGBA('#FFF', 0.5)).toEqual('rgba(255, 255, 255, 0.5)');
      expect(Utils.hexToRGBA('#FFFFFF', 0.5)).toEqual('rgba(255, 255, 255, 0.5)');
      expect(Utils.hexToRGBA('#E5FFCC', 1)).toEqual('rgba(229, 255, 204, 1)');
    });

    it('should round opacity', () => {
      expect(Utils.hexToRGBA('#FFF', 0.513434)).toEqual('rgba(255, 255, 255, 0.51)');
      expect(Utils.hexToRGBA('#FFF', 0.3999347)).toEqual('rgba(255, 255, 255, 0.4)');
      expect(Utils.hexToRGBA('#FFF', 1)).toEqual('rgba(255, 255, 255, 1)');
      expect(Utils.hexToRGBA('#FFF', 0)).toEqual('rgba(255, 255, 255, 0)');
    });

    it('should not return rgba if hex is not valid', () => {
      expect(Utils.hexToRGBA('#0000')).toEqual('#0000');
      expect(Utils.hexToRGBA('#FF')).toEqual('#FF');
    });
  });

  describe('.isValidHex', () => {
    it('should return true if the CSS is valid', () => {
      expect(Utils.isValidHex('#FFF')).toBeTruthy();
      expect(Utils.isValidHex('#FFFFFF')).toBeTruthy();
      expect(Utils.isValidHex('#E5FFCC')).toBeTruthy();
      expect(Utils.isValidHex('#fff')).toBeTruthy();
      expect(Utils.isValidHex('#111111')).toBeTruthy();
      expect(Utils.isValidHex('#000')).toBeTruthy();
      expect(Utils.isValidHex('#fabaDA')).toBeTruthy();
    });

    it('should return false if the CSS is not valid', () => {
      expect(Utils.isValidHex('FFF')).toBeFalsy();
      expect(Utils.isValidHex('#FFFFF')).toBeFalsy();
      expect(Utils.isValidHex('#C')).toBeFalsy();
      expect(Utils.isValidHex('red')).toBeFalsy();
      expect(Utils.isValidHex(' ')).toBeFalsy();
      expect(Utils.isValidHex('')).toBeFalsy();
      expect(Utils.isValidHex('#')).toBeFalsy();
    });
  });

  describe('.sanitizeString', () => {
    it('should sanitize strings', () => {
      expect(Utils.sanitizeString('this is a test')).toEqual('this_is_a_test');
      expect(Utils.sanitizeString('what?')).toEqual('what');
      expect(Utils.sanitizeString('This is fantaáÁñ!üË¿?=)stic')).toEqual('This_is_fantastic');
      expect(Utils.sanitizeString("I'm ok")).toEqual('Im_ok');
    });
  });

  describe('isNumeric', () => {
    it('should return proper output when provided with numbers and other things', () => {
      expect(Utils.isNumeric(34.5)).toBe(true);
      expect(Utils.isNumeric(-34.5)).toBe(true);
      expect(Utils.isNumeric('28.3')).toBe(true);
      expect(Utils.isNumeric('pepito')).toBe(false);
      expect(Utils.isNumeric(undefined)).toBe(false);
      expect(Utils.isNumeric(null)).toBe(false);
      expect(Utils.isNumeric(false)).toBe(false);
      expect(Utils.isNumeric(' ')).toBe(false);
    });
  });

  describe('formatDecimalPositions', () => {
    it('should return proper output when provided with numbers and other things', () => {
      expect(Utils.formatDecimalPositions(34.556)).toBe('34.6');
      expect(Utils.formatDecimalPositions(9.01)).toBe('9.01');
      expect(Utils.formatDecimalPositions(9.0)).toBe('9');
      expect(Utils.formatDecimalPositions(9.30)).toBe('9.30');
      expect(Utils.formatDecimalPositions(34.00)).toBe('34');
      expect(Utils.formatDecimalPositions(undefined)).toBe(undefined);
      expect(Utils.formatDecimalPositions(null)).toBe(null);
      expect(Utils.formatDecimalPositions(0)).toBe(0);
    });
  });

  describe('.removeNewLines', () => {
    it('should remove new lines from string', () => {
      expect(Utils.sanitizeString('this\nis\na\ntest')).toEqual('this_is_a_test');
    });
  });

  describe('.capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(Utils.capitalize('capitalize this, please')).toEqual('Capitalize this, please');
      expect(Utils.capitalize('a')).toEqual('A');
      expect(Utils.capitalize()).toEqual(undefined);
    });
  });
});
