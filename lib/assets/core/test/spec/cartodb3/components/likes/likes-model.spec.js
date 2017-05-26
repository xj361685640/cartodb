var LikesModel = require('../../../../../javascripts/cartodb3/components/likes/likes-model');

describe('components/likes/likes-model', () => {
  describe('by default', () => {
    beforeEach(() => {
      this.like = new LikesModel({
        vis_id: 'hello'
      }, {
        configModel: 'c'
      });
    });

    it('should be likeable', () => {
      expect(this.like.get('likeable')).toBeTruthy();
    });
  });

  describe('.newByVisData', () => {
    beforeEach(() => {
      this.visId = 123;
    });

    describe('when url is provided', () => {
      beforeEach(() => {
        this.like = LikesModel.newByVisData({
          url: 'http://patata.domain.com/api/like',
          vis_id: this.visId,
          configModel: 'c'
        });
      });

      it('should return a new like model with custom url', () => {
        expect(this.like.url).toBe('http://patata.domain.com/api/like');
      });
    });

    describe('when liked', () => {
      beforeEach(() => {
        this.like = LikesModel.newByVisData({
          vis_id: this.visId,
          liked: true,
          configModel: 'c'
        });
      });

      it('should return a new like model with liked set', () => {
        expect(this.like.get('liked')).toBeTruthy();
      });

      it('should return a new like model with id set to vis id', () => {
        expect(this.like.get('id')).toEqual(this.visId);
      });
    });

    describe('when not liked', () => {
      beforeEach(() => {
        this.like = LikesModel.newByVisData({
          vis_id: this.visId,
          configModel: 'c'
        });
      });

      it('should return a new like model with liked set to false', () => {
        expect(this.like.get('liked')).toBeFalsy();
      });

      it('should return a new like model with no id', () => {
        expect(this.like.get('id')).toBeNull();
      });
    });
  });
});
