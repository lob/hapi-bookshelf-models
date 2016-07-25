# Contributing

We encourage any form of contribution, whether that be issues, comments, or pull requests. If you plan to submit a Pull Request, please follow these guidelines to help keep the codebase clean:

* **Write tests.** We enforce 100% code coverage on this repo so any new code should be accompanied by tests.
* **Follow the linter.** We use our [ESLint configuration](https://github.com/lob/eslint-config-lob), and we run `npm run lint` in our Travis builds.
* **Follow the commit pattern.** We use [`generate-changelog`](https://github.com/lob/generate-changelog) for automatic changelog generation whenever we publish a new version, so please follow the commit message format: `feat(paths): add glob support`.
* **Squash your commits.** Ideally, your PR should have one commit in it. If you you need to add another one because of a typo or refactor, you should squash your commits together. This makes the changelog and commit history much more managable to go through. If you need help squashing them, we can always help you out!
* **Ask questions if you aren't sure.** If you have any questions while implementing a fix or feature, feel free to create an issue and ask us. We're happy to help!
