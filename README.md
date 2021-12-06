# @genee/fetch

## Usage

```typescript
import fetch from '@genee/fetch';

type UserData = {
    id: number;
    name: string;
};

(async () => {
    const user = await fetch<UserData>('path/to/user', {
        method: 'POST',
        body: {
            name: 'Doe John',
        },
        // timeout: 5000,   // default is 5000
        // json: true,      // default is true, return original text if json is false
    });
})();
```
