var UserModel = require('../../../../javascripts/cartodb3/data/user-model');
var PermissionModel = require('../../../../javascripts/cartodb3/data/permission-model');
var OrganizationModel = require('../../../../javascripts/cartodb3/data/organization-model');

describe('data/permission-model', () => {
  var model, user1, user2, org, owner;
  beforeEach(() => {
    this.owner = owner = new UserModel({
      id: 'uuid_owner',
      username: 'owner',
      viewer: false
    }, {
      configModel: 'c'
    });
    this.permission = model = new PermissionModel({
      owner: owner.toJSON(),
      entity: {
        id: 'test_id',
        type: 'vis'
      }
    }, {
      configModel: 'c'
    });

    user1 = new UserModel({
      id: 'uuid',
      username: 'u1',
      viewer: false
    }, {
      configModel: 'c'
    });

    user2 = new UserModel({
      id: 'uuid2',
      username: 'u2',
      viewer: false
    }, {
      configModel: 'c'
    });

    this.organization = org = new OrganizationModel({
      id: 'org_uuid',
      users: [{
        id: 'uuid2',
        username: 'u2'
      }]
    }, {
      configModel: 'c'
    });
    user2.organization = org;
  });

  describe('.isOwner', () => {
    it('should return true if given model is considered owner of item', () => {
      expect(this.permission.isOwner(user1)).toBe(false);
      expect(this.permission.isOwner({})).toBe(false);
      expect(this.permission.isOwner(this.owner)).toBe(true);
    });

    it('should return true if ids are not set for owner', () => {
      // otherwise there are tons of tests that fails randomly and stalls test suite
      this.permission.owner.unset('id');
      expect(this.permission.isOwner({})).toBe(true);
    });

    describe('when has no owner', () => {
      beforeEach(() => {
        this.permission.owner = undefined;
      });

      it('should return false when owner is not set', () => {
        expect(this.permission.isOwner(this.owner)).toBe(false);
      });
    });

    describe('when owner has no id', () => {
      beforeEach(() => {
        this.other = this.owner.clone();
      // this.permission.owner.set('id', undefined);
      });

      it('should return false when owner has no id', () => {
        expect(this.permission.isOwner(this.other)).toBe(false);
      });
    });
  });

  describe('.revokeWriteAccess', () => {
    beforeEach(() => {
      spyOn(this.permission, 'grantReadAccess');
      this.permission.revokeWriteAccess(user1);
    });

    it('should downgrade to read access', () => {
      expect(this.permission.grantReadAccess).toHaveBeenCalled();
      expect(this.permission.grantReadAccess).toHaveBeenCalledWith(user1);
    });
  });

  describe('.revokeAccess', () => {
    describe('when model has own ACL item', () => {
      beforeEach(() => {
        this.permission.acl.add(this.permission._newAclItem(user1, PermissionModel.READ_ONLY));
        this.permission.revokeAccess(user1);
      });

      it('should return the ACL item', () => {
        expect(this.permission.acl.length).toEqual(0);
      });
    });
  });

  // Test all can/has/grant-access methods at once, since they all depend on similar setups
  describe('access', () => {
    beforeEach(() => {
      // Setup various group scenarios for later use
      // this.groupX = new GroupModel({ id: 'gx' }, { configModel: 'c' });
      // this.permission.acl.add(this.permission._newAclItem(this.groupX, PermissionModel.READ_ONLY));
      // this.groupA = new GroupModel({ id: 'ga' }, { configModel: 'c' });
      // this.permission.acl.add(this.permission._newAclItem(this.groupA, PermissionModel.READ_ONLY));
      // this.groupB = new GroupModel({ id: 'gb' }, { configModel: 'c' });
      // this.permission.acl.add(this.permission._newAclItem(this.groupB, PermissionModel.READ_WRITE));
    });

    describe('when given a model w/o any access', () => {
      it('should not have any access', () => {
        expect(this.permission.hasAccess(user2)).toBe(false);
        expect(this.permission.hasReadAccess(user2)).toBe(false);
        expect(this.permission.hasWriteAccess(user2)).toBe(false);
      });

      it('should be able to set any access', () => {
        expect(this.permission.canChangeReadAccess(user2)).toBe(true);
        expect(this.permission.canChangeWriteAccess(user2)).toBe(true);
      });
    });

    describe('when given an owner', () => {
      it('should have all access', () => {
        expect(this.permission.hasAccess(this.owner)).toBe(true);
        expect(this.permission.hasReadAccess(this.owner)).toBe(true);
        expect(this.permission.hasWriteAccess(this.owner)).toBe(true);
      });

      it('should be able to set any access', () => {
        expect(this.permission.canChangeReadAccess(this.owner)).toBe(true);
        expect(this.permission.canChangeWriteAccess(this.owner)).toBe(true);
      });
    });

    describe('when given an user', () => {
      describe('when user is given read access', () => {
        beforeEach(() => {
          this.permission.grantReadAccess(user2);
        });

        it('should have read access', () => {
          expect(this.permission.hasAccess(user2)).toBe(true);
          expect(this.permission.hasReadAccess(user2)).toBe(true);
          expect(this.permission.hasWriteAccess(user2)).toBe(false);
        });

        it('should be able to set any access', () => {
          expect(this.permission.canChangeReadAccess(this.owner)).toBe(true);
          expect(this.permission.canChangeWriteAccess(this.owner)).toBe(true);
        });
      });

      describe('when user is given write access', () => {
        beforeEach(() => {
          this.permission.grantWriteAccess(user2);
        });

        it('should have both read+write access', () => {
          expect(this.permission.hasAccess(user2)).toBe(true);
          expect(this.permission.hasReadAccess(user2)).toBe(true);
          expect(this.permission.hasWriteAccess(user2)).toBe(true);
        });

        it('should be able to set any access', () => {
          expect(this.permission.canChangeReadAccess(this.owner)).toBe(true);
          expect(this.permission.canChangeWriteAccess(this.owner)).toBe(true);
        });
      });

      describe('when user is part of organization with read access', () => {
        beforeEach(() => {
          this.permission.grantReadAccess(this.organization);
        });

        it('should have read access', () => {
          expect(this.permission.hasAccess(user2)).toBe(true);
          expect(this.permission.hasReadAccess(user2)).toBe(true);
          expect(this.permission.hasWriteAccess(user2)).toBe(false);
        });

        it('should only be able to set write access if builder', () => {
          expect(this.permission.canChangeReadAccess(user2)).toBe(false);
          expect(this.permission.canChangeWriteAccess(user2)).toBe(true);
        });

        it('should not be able to set write access if viewer', () => {
          user2.set({viewer: true});
          expect(this.permission.canChangeReadAccess(user2)).toBe(false);
          expect(this.permission.canChangeWriteAccess(user2)).toBe(false);
        });

        describe('when organization has write access', () => {
          beforeEach(() => {
            this.permission.grantWriteAccess(this.organization);
          });

          it('should have both read+write access', () => {
            expect(this.permission.hasAccess(user2)).toBe(true);
            expect(this.permission.hasReadAccess(user2)).toBe(true);
            expect(this.permission.hasWriteAccess(user2)).toBe(true);
          });

          it('should not be able to change any access', () => {
            expect(this.permission.canChangeReadAccess(user2)).toBe(false);
            expect(this.permission.canChangeWriteAccess(user2)).toBe(false);
          });
        });
      });
    });

  //   describe('when given a group', () => {
  //     describe('when given group has own access', () => {
  //       it('should have the expected access', () => {
  //         expect(this.permission.hasAccess(this.groupX)).toBe(true);
  //         expect(this.permission.hasReadAccess(this.groupX)).toBe(true);
  //         expect(this.permission.hasWriteAccess(this.groupX)).toBe(false);
  //
  //         expect(this.permission.hasAccess(this.groupA)).toBe(true);
  //         expect(this.permission.hasReadAccess(this.groupA)).toBe(true);
  //         expect(this.permission.hasWriteAccess(this.groupA)).toBe(false);
  //
  //         expect(this.permission.hasAccess(this.groupB)).toBe(true);
  //         expect(this.permission.hasReadAccess(this.groupB)).toBe(true);
  //         expect(this.permission.hasWriteAccess(this.groupB)).toBe(true);
  //       });
  //
  //       describe('when group is part of organization that has more privileged access', () => {
  //         beforeEach(() => {
  //           this.permission.grantWriteAccess(this.organization);
  //           this.organization.groups.add(this.groupA);
  //         });
  //
  //         it('should have organization access', () => {
  //           expect(this.permission.hasAccess(this.groupA)).toBe(true);
  //           expect(this.permission.hasReadAccess(this.groupA)).toBe(true);
  //           expect(this.permission.hasWriteAccess(this.groupA)).toBe(true);
  //         });
  //
  //         it('should not be able to change any access', () => {
  //           expect(this.permission.canChangeReadAccess(this.groupA)).toBe(false);
  //           expect(this.permission.canChangeWriteAccess(this.groupA)).toBe(false);
  //         });
  //       });
  //     });
  //
  //     describe('when group w/o own access but is part of organization with read access', () => {
  //       beforeEach(() => {
  //         this.permission.grantReadAccess(this.organization);
  //         this.organization.groups.add(this.groupX);
  //       });
  //
  //       it('should have the organization read access', () => {
  //         expect(this.permission.hasAccess(this.groupX)).toBe(true);
  //         expect(this.permission.hasReadAccess(this.groupX)).toBe(true);
  //         expect(this.permission.hasWriteAccess(this.groupX)).toBe(false);
  //       });
  //
  //       it('should only be able to change write access', () => {
  //         expect(this.permission.canChangeReadAccess(this.groupX)).toBe(false);
  //         expect(this.permission.canChangeWriteAccess(this.groupX)).toBe(true);
  //       });
  //
  //       describe('when organization has write access', () => {
  //         beforeEach(() => {
  //           this.permission.grantWriteAccess(this.organization);
  //           this.organization.groups.add(this.groupX);
  //         });
  //
  //         it('should have the organization read+write access', () => {
  //           expect(this.permission.hasAccess(this.groupX)).toBe(true);
  //           expect(this.permission.hasReadAccess(this.groupX)).toBe(true);
  //           expect(this.permission.hasWriteAccess(this.groupX)).toBe(true);
  //         });
  //
  //         it('should not be able to change any access', () => {
  //           expect(this.permission.canChangeReadAccess(this.groupX)).toBe(false);
  //           expect(this.permission.canChangeWriteAccess(this.groupX)).toBe(false);
  //         });
  //       });
  //     });
  //   });
  //
  //   describe('when given a user w/o own access but is member of group with read access', () => {
  //     beforeEach(() => {
  //       user1.groups.add(this.groupA);
  //     });
  //
  //     it('should have the group access', () => {
  //       expect(this.permission.hasAccess(user1)).toBe(true);
  //       expect(this.permission.hasReadAccess(user1)).toBe(true);
  //       expect(this.permission.hasWriteAccess(user1)).toBe(false);
  //     });
  //
  //     it('should only be able to change write access', () => {
  //       expect(this.permission.canChangeReadAccess(user1)).toBe(false);
  //       expect(this.permission.canChangeWriteAccess(user1)).toBe(true);
  //     });
  //
  //     describe('when user is member of multiple groups', () => {
  //       beforeEach(() => {
  //         user1.groups.add(this.groupB);
  //       });
  //
  //       it('should have the most privileged access of the grops', () => {
  //         expect(this.permission.hasAccess(user1)).toBe(true);
  //         expect(this.permission.hasReadAccess(user1)).toBe(true);
  //         expect(this.permission.hasWriteAccess(user1)).toBe(true);
  //       });
  //
  //       it('should not be able to change any access (since has write inherited)', () => {
  //         expect(this.permission.canChangeReadAccess(user1)).toBe(false);
  //         expect(this.permission.canChangeWriteAccess(user1)).toBe(false);
  //       });
  //     });
  //
  //     describe('when user is also part of organization with read+write access', () => {
  //       beforeEach(() => {
  //         this.permission.grantWriteAccess(this.organization);
  //         user1.organization = this.organization;
  //       });
  //
  //       it('should return the organization access since it has precedence over groups', () => {
  //         expect(this.permission.hasAccess(user1)).toBe(true);
  //         expect(this.permission.hasReadAccess(user1)).toBe(true);
  //         expect(this.permission.hasWriteAccess(user1)).toBe(true);
  //       });
  //
  //       it('should not be able to change any access (since has write inherited)', () => {
  //         expect(this.permission.canChangeReadAccess(user1)).toBe(false);
  //         expect(this.permission.canChangeWriteAccess(user1)).toBe(false);
  //       });
  //     });
  //
  //     describe('when user is part of organization with read+write access', () => {
  //       beforeEach(() => {
  //         // treat user1 as if retrieved through org users collection
  //         user1.organization = null;
  //         this.organization.users.add(user1);
  //         this.permission.grantWriteAccess(this.organization);
  //       });
  //
  //       it('should return the organization access since it has precedence over groups', () => {
  //         expect(this.permission.hasAccess(user1)).toBe(true);
  //         expect(this.permission.hasReadAccess(user1)).toBe(true);
  //         expect(this.permission.hasWriteAccess(user1)).toBe(true);
  //       });
  //
  //       it('should not be able to change any access (since has write inherited)', () => {
  //         expect(this.permission.canChangeReadAccess(user1)).toBe(false);
  //         expect(this.permission.canChangeWriteAccess(user1)).toBe(false);
  //       });
  //     });
  //
  //     describe('when user has organization read-only access', () => {
  //       beforeEach(() => {
  //         user1.organization = this.organization;
  //         this.permission.grantReadAccess(this.organization);
  //       });
  //
  //       it('should return the organization access', () => {
  //         expect(this.permission.hasAccess(user1)).toBe(true);
  //         expect(this.permission.hasReadAccess(user1)).toBe(true);
  //         expect(this.permission.hasWriteAccess(user1)).toBe(false);
  //       });
  //
  //       it('should be able to change write access only', () => {
  //         expect(this.permission.canChangeReadAccess(user1)).toBe(false);
  //         expect(this.permission.canChangeWriteAccess(user1)).toBe(true);
  //       });
  //
  //       describe('when user has better access than organization', () => {
  //         beforeEach(() => {
  //           this.permission.grantWriteAccess(user1);
  //         });
  //
  //         it('should have read+write access', () => {
  //           expect(this.permission.hasAccess(user1)).toBe(true);
  //           expect(this.permission.hasReadAccess(user1)).toBe(true);
  //           expect(this.permission.hasWriteAccess(user1)).toBe(true);
  //         });
  //
  //         it('should be able to change access', () => {
  //           expect(this.permission.canChangeReadAccess(user1)).toBe(true);
  //           expect(this.permission.canChangeWriteAccess(user1)).toBe(true);
  //         });
  //       });
  //
  //       describe('when user is also owner', () => {
  //         beforeEach(() => {
  //           this.permission.owner = user1;
  //         });
  //
  //         it('should have read+write access', () => {
  //           expect(this.permission.hasAccess(user1)).toBe(true);
  //           expect(this.permission.hasReadAccess(user1)).toBe(true);
  //           expect(this.permission.hasWriteAccess(user1)).toBe(true);
  //         });
  //
  //         it('should be able to change access', () => {
  //           expect(this.permission.canChangeReadAccess(user1)).toBe(true);
  //           expect(this.permission.canChangeWriteAccess(user1)).toBe(true);
  //         });
  //       });
  //     });
  //   });
  });

  it('should parse owner and acl', () => {
    model = new PermissionModel({
      owner: {
        username: 'rambo'
      },
      acl: [
        {
          type: 'user',
          entity: {
            id: 'u1',
            username: 'u1'
          },
          access: 'r'
        },
        {
          type: 'user',
          entity: {
            id: 'u2',
            username: 'u2'
          },
          access: 'rw'
        }
      ]
    }, { configModel: 'c' });

    expect(model.owner.get('username')).toEqual('rambo');
    expect(model.acl.length).toEqual(2);
    expect(model.acl.at(0).get('entity').get('username')).toEqual('u1');
  });

  it('toJSON', () => {
    model.grantReadAccess(user1);
    model.grantWriteAccess(user2);
    expect(model.toJSON()).toEqual({
      entity: {
        id: 'test_id',
        type: 'vis'
      },
      acl: [
        { type: 'user', entity: { id: 'uuid', username: 'u1', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'r' },
        { type: 'user', entity: { id: 'uuid2', username: 'u2', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'rw' }
      ]
    });
  });

  it('updates owner', () => {
    model.set('owner', { username: 'changed' });
    expect(model.owner.get('username')).toEqual('changed');
    model.set('acl', [
      { type: 'user', entity: { id: 'uuid', username: 'u1', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'r' },
      { type: 'user', entity: { id: 'uuid2', username: 'u2', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'rw' }
    ]);
    expect(model.acl.length).toEqual(2);
  });

  it("shouldn't trigger an acl reset change when acl is re-generated", () => {
    var count = 0;

    model.acl.bind('reset', () => {
      ++count;
    });

    model.set('acl', [
      { type: 'user', entity: { id: 'uuid', username: 'u1', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'r' },
      { type: 'user', entity: { id: 'uuid2', username: 'u2', avatar_url: 'http://cartodb.s3.amazonaws.com/static/public_dashboard_default_avatar.png' }, access: 'rw' }
    ]);

    expect(count).toEqual(0);
  });

  describe('.clone', () => {
    beforeEach(() => {
      model.set('id', 'abc-123', { silent: true });
      this.permission = model.clone();
    });

    it('should return a new Permission object', () => {
      expect(this.permission).not.toBe(model);
      expect(this.permission instanceof PermissionModel).toBeTruthy();
    });

    it('should contain the same attributes as the original permission', () => {
      expect(this.permission.owner).not.toBeUndefined();
      expect(this.permission.acl).not.toBeUndefined();
    });

    it('should not have an id set', () => {
      expect(this.permission.get('id')).toBeUndefined();
      expect(this.permission.get('id')).not.toEqual(model.get('id'));
    });
  });

  describe('.overwriteAcl', () => {
    beforeEach(() => {
      this.otherPermission = model.clone();
      this.otherPermission.grantReadAccess(user1);
      this.otherPermission.grantWriteAccess(user2);
      model.overwriteAcl(this.otherPermission);
    });

    it('should set the ACL list from other permission object', () => {
      expect(model.acl.models).toEqual(this.otherPermission.acl.models);
    });
  });
});
