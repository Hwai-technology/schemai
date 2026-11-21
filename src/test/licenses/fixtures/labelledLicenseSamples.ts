export interface LabelledLicenseSample {
  kind: 'repository' | 'header';
  expected: string;
  license: unknown;
  header?: string;
}

export const labelledLicenseSamples: LabelledLicenseSample[] = [
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'MIT', license: { license: { spdx_id: 'MIT' } } },
  { kind: 'repository', expected: 'GPL-3.0', license: { license: { spdx_id: 'GPL-3.0' } } },
  { kind: 'repository', expected: 'GPL-3.0', license: { license: { spdx_id: 'GPL-3.0' } } },
  { kind: 'repository', expected: 'GPL-3.0', license: { license: { spdx_id: 'GPL-3.0' } } },
  { kind: 'repository', expected: 'GPL-3.0', license: { license: { spdx_id: 'GPL-3.0' } } },
  { kind: 'repository', expected: 'Apache-2.0', license: { license: { spdx_id: 'Apache-2.0' } } },
  { kind: 'repository', expected: 'Apache-2.0', license: { license: { spdx_id: 'Apache-2.0' } } },
  { kind: 'repository', expected: 'Apache-2.0', license: { license: { spdx_id: 'Apache-2.0' } } },
  { kind: 'repository', expected: 'NONE', license: { license: null } },
  { kind: 'repository', expected: 'NONE', license: { license: { spdx_id: 'NOASSERTION' } } },
  {
    kind: 'header',
    expected: 'MIT',
    license: null,
    header: 'MIT License Permission is hereby granted, free of charge. Substantial portions of the software.'
  },
  {
    kind: 'header',
    expected: 'MIT',
    license: null,
    header: 'MIT License Permission is hereby granted, free of charge. Substantial portions of the software.'
  },
  {
    kind: 'header',
    expected: 'MIT',
    license: null,
    header: 'MIT License Permission is hereby granted, free of charge. Substantial portions of the software.'
  },
  {
    kind: 'header',
    expected: 'GPL-3.0',
    license: null,
    header: 'GNU General Public License Free Software Foundation. without even the implied warranty of merchantability'
  },
  {
    kind: 'header',
    expected: 'GPL-3.0',
    license: null,
    header: 'GNU General Public License either version 3 of the License. without even the implied warranty of merchantability'
  },
  {
    kind: 'header',
    expected: 'GPL-3.0',
    license: null,
    header: 'GNU General Public License Free Software Foundation. without even the implied warranty of merchantability'
  },
  {
    kind: 'header',
    expected: 'Apache-2.0',
    license: null,
    header: 'Apache License, Version 2.0 You may not use this file except in compliance with the License'
  },
  {
    kind: 'header',
    expected: 'Apache-2.0',
    license: null,
    header: 'Apache License, Version 2.0 You may not use this file except in compliance with the License'
  },
  {
    kind: 'header',
    expected: 'NONE',
    license: null,
    header: 'This file is an internal implementation with no license notice.'
  },
  {
    kind: 'header',
    expected: 'NONE',
    license: null,
    header: 'Internal utility code; no external license header is present.'
  },
  {
    kind: 'header',
    expected: 'MIT',
    license: null,
    header: 'MIT License Permission is hereby granted, free of charge. Substantial portions of the software.'
  },
  {
    kind: 'header',
    expected: 'GPL-3.0',
    license: null,
    header: 'GNU General Public License Free Software Foundation. without even the implied warranty of merchantability'
  },
  {
    kind: 'header',
    expected: 'Apache-2.0',
    license: null,
    header: 'Apache License, Version 2.0 You may not use this file except in compliance with the License'
  },
  {
    kind: 'header',
    expected: 'MIT',
    license: null,
    header: 'MIT License Permission is hereby granted, free of charge. Substantial portions of the software.'
  },
  {
    kind: 'header',
    expected: 'GPL-3.0',
    license: null,
    header: 'GNU General Public License either version 3 of the License. without even the implied warranty of merchantability'
  }
];
