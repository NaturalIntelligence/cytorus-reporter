# cytorus-reporter

> Note: Use it with cytorus >= v0.2

```bash
$ npm install -D cytorus-reporter
```

Use
```js
const CucumerReporter = require("cytorus-reporter/cucumber");
//empty the output/report directory
const cucumerReporter = new CucumerReporter(cucumerReportsPath, basePath, inputFileLocation);
await cucumerReporter.report();
```