const store = require('./index');

const sleep = ms => obj => new Promise(cb => setTimeout(() => cb(obj),ms));

describe('easy-store', () => {
  const thing = store('thing');

  beforeEach(thing.clean);

  it('creates objects', () => {
    const name = 'someName';
    const now = Date.now();

    return thing.create({name}).then(obj => {
      expect(now - obj.createdAt).toBeLessThan(5);
      expect(obj.updatedAt).toEqual(obj.createdAt);
      expect(obj.name).toEqual(name);
      expect(typeof obj.id).toEqual('string');
    });
  });

  it('does not require anything to create an object', () => {
    const now = Date.now();

    return thing.create().then(obj => {
      expect(now - obj.createdAt).toBeLessThan(5);
      expect(obj.updatedAt).toEqual(obj.createdAt);
      expect(typeof obj.id).toEqual('string');
      expect(Object.keys(obj)).toHaveLength(3);
    });
  });

  it('queries objects', () => {
    return thing.create()
      .then(sleep(10))
      .then(() => thing.create())
      .then(sleep(10))
      .then(() => thing.create())
      .then(sleep(10))
      .then(() => thing.create())
      .then(sleep(10))
      .then(() => thing.query())
      .then(list => {
        expect(list).toHaveLength(4)

        console.log(list[0])
        
        const len = list.length;
        let i = 0;

        while (++i < len) {
          const a = list[i - 1];
          const b = list[i];

          expect(a.createdAt).toBeLessThan(b.createdAt);
        }
      });
  });

  it('updates objects', () => {
    let createdAt;
    const name = 'someOtherName';
    const next = 'theNextName';

    return thing.create({name})
    .then(obj => {
      createdAt = obj.createdAt;

      expect(obj.name).toEqual(name);
      expect(obj.updatedAt).toEqual(obj.createdAt);

      return thing.update({id: obj.id, name: next});
    })
    .then(sleep(10))
    .then(obj => {
      expect(obj.createdAt).toEqual(createdAt);
      expect(obj.updatedAt).toBeGreaterThan(obj.createdAt);
      expect(obj.name).toEqual(next);
    });
  });

  it('removes objects', () => {
    return thing.create({})
    .then(obj => thing.remove(obj.id))
    .then(() => thing.query())
    .then(list => expect(list).toHaveLength(0));
  });
});
