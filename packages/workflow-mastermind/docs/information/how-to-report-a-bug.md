# How to report a bug

**Security Disclosures**

{% hint style="warning" %}
Any security issues should be submitted directly to [security@tgtmedia.org](mailto:security@tgtmedia.org)
{% endhint %}

 In order to determine whether you are dealing with a security issue, ask yourself these two questions:

* Can I access something that's not mine, or something I shouldn't have access to?
* Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us at security@tgtmedia.org.

**Opening Issue**

When filing an issue, make sure to answer these five questions:

1. What version are you using?
2. What operating system and processor architecture are you using?
3. What did you do?
4. What did you expect to see?
5. What did you see instead?

General questions should go to the \[Support Centre\]\[10\] instead of the issue tracker. The support team there will answer and open a issue if required.

**Suggested Labels**

* **Issue Types**
  * **Bug** - Anything that is broken
  * **Regression** - A bug that did not exist in previous versions and isn't a new feature \(applied in tandem with Bug\)
  * **Feature** - Anything that involves API changes, should generally only be for PRs or bug reports on in-progress features.
  * **Performance** - A performance related issue. We could track this as a bug, but usually these would have slightly lower priority than standard bugs.
  * **Clean-up** - Not a bug, not a feature, just code clean-up.
  * **Documentation** - Self-explanatory.
* **Blockers**
  * **Needs Bug Verification** - A bug report, needs verification that it's actually a bug.
  * **Needs Reproduction** - Needs a test case or other reproduction of the issue.
  * **Has Reproduction** - Indicates a test case exists and is up-to-date.
  * **Ready for PR** - A well defined bug, needs someone to PR a fix.
  * **PR Pending** - A well defined bug, with a PR pending to fix.
  * **Needs Code Review** - A PR that needs the code to be verified by someone.
  * **Needs Submitter Response** - Anything that is blocking on the submitter.
  * **Needs Team Discussion** - Cannot progress until the core team has discussed further.
* **Miscellaneous** - These are per project and might be useful for further organization but should be kept to a minimum as well.
  * **good first issue** - What it says on the tin. This helps new people find stuff to work on, because [GitHub actively promotes it](https://help.github.com/articles/helping-new-contributors-find-your-project-with-labels/) and [initializes new repositories with that label](https://help.github.com/articles/about-labels/#using-default-labels).

