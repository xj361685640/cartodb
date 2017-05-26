var errorParser = require('../../../../javascripts/cartodb3/helpers/error-parser');

describe('helpers/error-parser', () => {
  it('should not provide error info if there isn\'t anything', () => {
    expect(errorParser({})).toBe('');
  });

  it('should provide status text if there is no response text', () => {
    var error = {
      statusText: ':scream:'
    };
    expect(errorParser(error)).toBe(':scream:');
  });

  it('should not provide anything if response is not correctly defined', () => {
    var error = {
      whatever: true,
      error: 'haasss',
      responseText: '{error: ["boom"]}' // Bad JSON
    };
    expect(errorParser(error)).toBe('');
  });

  it('should return error if it is defined within responseText', () => {
    var error = {
      statusText: 'hello',
      responseText: '{"error": ["boom"]}'
    };
    expect(errorParser(error)).toBe('boom');
  });

  it('should return several errors if there are more than one', () => {
    var error = {
      statusText: 'hello',
      responseText: '{"error": ["boom", "danger"]}'
    };
    expect(errorParser(error)).toBe('boom, danger');
  });

  it('should display all errors together although they are different', () => {
    var error = {
      statusText: 'hello',
      responseText: '{"error": ["boom", "danger"], "errors": ["hellooo"]}'
    };
    expect(errorParser(error)).toBe('hellooo, boom, danger');
  });

  it('should return status text if responseText is a blank space', () => {
    var error = {
      responseText: ' ',
      statusText: 'Forbidden'
    };
    expect(errorParser(error)).toBe(error.statusText);
  });
});
