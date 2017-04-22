A simple storage mechanism for doing demos and stuff where you require some persistence. Saves JSON files to disk in your OS's temp directory. Only works in Node.

### Install

```
yarn add easy-store
```

### Use

```js
import store from 'easy-store';

const users = store('users');

await users.create({name: 'Fart', email: 'cooldude@example.com'});
/*
  {
    id: 'SJb2pWGOAe',
    name: 'Fart',
    email: 'cooldude@example.com',
    createdAt: 1492816324108,
    updatedAt: 1492816324108
  }
*/

await users.get('SJb2pWGOAe');
// { id: 'SJb2pWGOAe', ... }

await users.query()
// [{ id: 'SJb2pWGOAe', ... }]

await users.query(u => u.email === 'cooldude@example.com');
// [{ id: 'SJb2pWGOAe', ... }]

await users.update({id: 'SJb2pWGOAe', name: 'Next'});
// { id: 'SJb2pWGOAe', name: 'Next', ... }

await users.remove('SJb2pWGOAe')
// { id: 'SJb2pWGOAe' }
```
