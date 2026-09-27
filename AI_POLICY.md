<!-- Generated from Resnovas/.github templates/AI_POLICY.md. Edit it there, not here. -->
# <a id="top"></a>AI Contribution Policy

AI tools are welcome here.
This policy exists so that everyone can see who used them, how much, and who answers for the result.
It is not here to slow down anyone acting in good faith.
It is here so that maintainers are not buried under submissions nobody has read.

The rule behind every rule below: **a human is accountable for everything submitted, and "the AI did that" is never an excuse.**

This policy is part of the [Contributing Guidelines](CONTRIBUTING.md) and is enforced through the [Code of Conduct](CODE_OF_CONDUCT.md).
Contributions are made under the [Developer Certificate of Origin](DCO.md) and licensed under the [FCL-1.0-MIT licence](LICENSE), and licence breaches are cured through the [Cooperation Commitment](COOPERATION_COMMITMENT.md).

## <a id="keywords"></a>How to read this policy

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT** and **MAY** mean what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) says they mean.
Every rule has an identifier, for example [AI-02](#ai-02), so reviewers can link to the exact rule a submission broke.
Rules marked **(checked)** are enforced automatically on every pull request.

## <a id="definitions"></a>Definitions

### AI tool
Any software that generates or transforms code, text, tests, reviews or other content using a machine learning model.
Includes, but is not limited to, Claude, ChatGPT and Codex, GitHub Copilot, Cursor, Gemini, Aider and Devin.

### Agent
An AI tool that plans or carries out more than one step on its own: editing files, running commands, committing, or posting to GitHub.

### Accountable human
The one named person who answers for a submission.
They sign off every commit, understand every material change, and reply to reviewers.
There is exactly one per submission, and it is never an AI tool.

### Material change
Any change to logic, behaviour or documentation.
The test is simple and leaves no room for argument: **if a linter or formatter could not have produced the change, it is material.**
There is one exception: a pure rename of an identifier, file or directory, with no other change, is not material even though no formatter could produce it.

| Material | Not material |
| --- | --- |
| A new condition, branch, function or test | Re-indenting or re-wrapping a file |
| A changed error message, log line or default value | Sorting imports |
| A paragraph of documentation, or a reworded one | Fixing whitespace or line endings |
| A generated migration, schema or fixture | Renaming an identifier with no other change |

### Submission
An issue, pull request, commit, review, or comment in any of this project's repositories.

### Maintainer
A person listed as a maintainer in [the governance document](GOVERNANCE.md).

### Outside contributor
Anyone submitting who is not a maintainer.

### Production branch
The branch that published releases are cut from.

## <a id="levels"></a>Autonomy levels

Every submission declares the highest level of AI involvement in it.
Pick the level that describes what the tool actually did, not what you intended it to do.

| Level | Meaning | Examples |
| --- | --- | --- |
| `none` | No AI tool touched the submission. | You wrote the code and the description yourself. Your editor's non-AI autocomplete of a known symbol name does not count. |
| `autocomplete` | An AI tool suggested inline completions, and you accepted some. | Copilot or Cursor Tab finished a line or a function body as you typed. You did not open a chat or ask for anything. |
| `chat` | You asked an AI tool for suggestions, explanations or code, then chose what to apply and applied it yourself. | You pasted an error into ChatGPT and adapted its answer. You asked Claude how to structure a module, then wrote it. The tool never edited your files. |
| `agent` | An AI tool edited files, ran commands or made commits while you directed it and watched. | Claude Code or Cursor Agent implemented a change in your working copy over several steps while you steered it. Codex ran the test suite and fixed the failures it found. |
| `autonomous` | An AI tool carried out the work, or opened the submission, without a human directing it step by step. | An agent picked up an issue overnight and opened a draft pull request. A background agent triaged a bug and filed an issue. A scheduled agent opened a dependency or refactoring pull request. |

If you are unsure between two levels, choose the higher one.

## <a id="everyone"></a>Rules for every submission

### <a id="ai-01"></a>AI-01: Disclose on every submission (checked)

Every pull request and issue **MUST** state its autonomy level and, unless the level is `none`, every AI tool and model used, for example `Claude Code (claude-opus-5-5)`.
The pull request template and issue forms have the fields; fill them in rather than deleting them.
A level of `none` **MUST NOT** be combined with an AI co-author or a listed tool.
The [trusted bots](GOVERNANCE.md#trusted-bots) (`dependabot[bot], renovate[bot], github-actions[bot], resnovas-smartcloud[bot]`) are exempt from the checked rules (AI-01 to AI-03, [AI-20](#ai-20) and [AI-21](#ai-21)), because no person writes their pull requests.

### <a id="ai-02"></a>AI-02: Credit the AI as a co-author (checked)

Every commit containing a material change produced by an AI tool **MUST** carry two trailers for that tool:

- `Co-authored-by`, so the involvement shows in the history and on GitHub;
- `Assisted-by: TOOL:MODEL`, in the form the Linux kernel uses, recording exactly which tool and model did the work.
Further tools the agent used **MAY** follow on the same line, separated by spaces.

The two always travel together: a commit with one and not the other fails the check.
For `Co-authored-by`:

- The name **MUST** identify the tool and the model, for example `Claude Opus 5.5`.
- The address **MUST** be the one the tool itself uses for attribution, for example `noreply@anthropic.com` for Claude.
- If the tool publishes no attribution address, use `<tool-name>@ai.invalid`.
The `.invalid` domain is reserved, so the address can never belong to a real person.
- Credit every tool that materially changed the commit, one pair of trailers each.

```
fix(auth): reject expired refresh tokens

Co-authored-by: Claude Opus 5.5 <noreply@anthropic.com>
Assisted-by: claude-code:claude-opus-5-5
Signed-off-by: Jane Doe <jane@example.com>
```

Accepted AI autocomplete counts: if it wrote logic, it is a material change and needs both trailers.

### <a id="ai-03"></a>AI-03: An AI tool never signs off (checked)

`Signed-off-by` certifies the [Developer Certificate of Origin](DCO.md).
Only a person can make that certification, so a `Signed-off-by` trailer **MUST** name the accountable human and **MUST NOT** name an AI tool.
By signing off, the accountable human certifies the AI-produced parts as well as their own.
This is the same approach the Linux kernel takes.

Tooling the accountable human has set up, including their own agent, **MAY** add the human's sign-off for them.
It is still their certification, and they stand behind it when they mark the pull request ready ([AI-21](#ai-21)).
An agent **MUST NOT** add a sign-off for anyone who has not set it up to do so.

### <a id="ai-04"></a>AI-04: Understand everything you submit

The accountable human **MUST** be able to explain every material change without consulting the tool.
If a reviewer asks why a line exists and the answer is "the AI wrote it", the submission is not ready.

### <a id="ai-05"></a>AI-05: Speak for yourself

Problem statements, rationale, and replies to reviewers **MUST** be written by the accountable human, in their own words.
A review comment written by a human **MUST** get a reply written by a human, even when the code in that reply was produced by an AI tool.
An AI tool **MAY** help build tests and reproductions.
It **MUST NOT** speak as you.
Imperfect writing is fine; we would rather read you than a model.

### <a id="ai-06"></a>AI-06: Evidence, not assertions

Every test, command or execution you mention **MUST** come with verifiable output: the exact command, the full relevant output, and the commit it ran against, or a link to the CI run that shows it.
"It works", "tests pass" or a ticked box is not evidence.
You **MUST NOT** claim testing you did not perform.
The evidence a change needs is set out in [Evidence by type of change](#evidence).

### <a id="ai-07"></a>AI-07: Verify every identifier

Versions, stack traces, file paths, function names, error codes and URLs **MUST** match what is actually published: the release, the website, or the code at the commit you name.
If the problem is in unreleased code, identify it by full commit SHA.
Check them before submitting.
AI tools invent plausible identifiers, and a submission containing one that does not exist **MAY** be closed without further consideration.

### <a id="ai-08"></a>AI-08: Keep it about the code

A pull request describes the code in it, nothing more and nothing less.
It **MUST NOT** contain conversation transcripts, prompts, the history of how you got there, or background the code does not need.
Add context only when the code cannot be understood without it.
A description longer than the diff it describes, or one that restates the diff line by line, will be sent back.

### <a id="ai-09"></a>AI-09: Write for people

Titles, descriptions, comments and commit messages **MUST NOT** contain emoji.
Use ordinary punctuation; do not scatter em dashes and en dashes through the text.
Write plainly, in the language as people use it.
Checklists **MUST NOT** be left unticked or pasted in as decoration; state what you did.

### <a id="ai-10"></a>AI-10: Search before you submit

Before opening an issue or pull request you **MUST** search open and closed issues and pull requests for duplicates, and say what you searched for.
An AI tool that files a duplicate has wasted a maintainer's time on your behalf.

### <a id="ai-11"></a>AI-11: Never weaken tests to go green

You **MUST NOT** delete, skip, loosen or rewrite an existing test to make a change pass.
If the code fails a test, fix the code.
If the test is genuinely wrong, say so and why in its own commit, and let a maintainer decide.
This is the one rule with no warning step: breaking it leads to a [permanent ban](#enforcement).

### <a id="ai-12"></a>AI-12: No unrequested dependencies

You **MUST NOT** add a dependency a maintainer has not already approved for this change.
Agents add packages readily; ask first in the issue.

### <a id="ai-13"></a>AI-13: Respect the module boundaries

The **core** package holds domain-agnostic building blocks only.
Vendor SDKs, API clients and service-specific configuration belong in `@resnovas/integrations.<vendor>`.
A change that puts vendor code in core, or reaches across components, **MUST** be refactored by the submitter before review continues.
Getting this right the first time is much cheaper than moving it later.

### <a id="ai-14"></a>AI-14: Own the licence of what you submit

AI tools can reproduce existing code close to verbatim.
The accountable human **MUST** make sure no submitted material is copied from a source whose licence is incompatible with this project's, and is answerable for it under the DCO if it is.
See [Licence consequences](#licence).

### <a id="ai-15"></a>AI-15: No unsolicited AI reviews

You **MUST NOT** post an AI-generated review of someone else's pull request unless a maintainer asked for one.
The review tools this project configures itself are the exception; they are listed in [the known review tools](CONTRIBUTING.md#ReviewTools).

## <a id="contributors"></a>Submitting as a contributor

These rules apply to everyone who opens issues or pull requests, including maintainers.

### <a id="ai-20"></a>AI-20: AI-assisted pull requests start as drafts (checked)

A pull request with any autonomy level other than `none` **MUST** be opened as a draft.
It stays a draft while you review it.

### <a id="ai-21"></a>AI-21: Leaving draft is your signature (checked)

You **MAY** mark the pull request ready for review only once you have personally:

1. read every changed line;
1. run the change and the tests yourself, and attached the output ([AI-06](#ai-06));
1. checked every identifier ([AI-07](#ai-07));
1. signed off every commit ([AI-03](#ai-03)).

Marking it ready means you take responsibility for it.
At that point `Accountable human` **MUST** be your GitHub handle, and `Human review` **MUST** state what you reviewed and ran.

### <a id="evidence"></a>Evidence by type of change

| Change | Evidence required |
| --- | --- |
| Behaviour or UI | A before and after recording, plus the output of the tests that cover it. |
| Backend or logic | Regression tests that fail before the change and pass after it, with their output. |
| Performance | Reproducible before and after benchmarks, with the command and environment. |
| Bug fix | The reproduction from the issue, run on the production branch, now passing. |
| Documentation, CI or pure refactor | The relevant checks and one sentence on why nothing else changed. Do not fabricate a recording. |

Test coverage **MUST NOT** fall below 90% for lines or branches, and most repositories expect 100%.
Code quality is never traded for speed.

### <a id="issues"></a>Issues

Bug reports **MUST** reproduce the problem on the production branch and include the exact steps, the version or commit, logs, and a recording or screenshots.
A bug report without a reproduction will be slowed down or closed for lack of evidence.

Feature requests **SHOULD** be short.
Say what problem you have and what you propose.
Do not pad them.

## <a id="agents"></a>Autonomous agents

These rules apply to any agent submitting at the `autonomous` level, and to the human who runs it.

### <a id="ai-30"></a>AI-30: Every agent has a named human

An agent **MUST** act under a GitHub account belonging to, or explicitly delegated by, one named person.
That person is the accountable human for everything the agent submits, whether or not they watched it happen.
An agent that cannot be traced to a person **MUST NOT** submit anything.

### <a id="ai-31"></a>AI-31: Agents open drafts and stop

An agent **MAY** open issues and draft pull requests.
It **MUST NOT** mark a pull request ready for review, approve, merge, or sign off a commit.
Those steps belong to the accountable human under [AI-21](#ai-21).

### <a id="ai-32"></a>AI-32: Agents identify themselves

An agent **MUST** declare the `autonomous` level, credit itself as a co-author under [AI-02](#ai-02), and name its tool and model.
It **MUST NOT** present its output as written by a person.

### <a id="ai-33"></a>AI-33: Agents do not answer reviewers

An agent **MAY** push commits that address review feedback.
It **MUST NOT** reply to a human reviewer's comment as though it were the accountable human ([AI-05](#ai-05)).

### <a id="ai-34"></a>AI-34: Agents stay in scope

An agent **MUST** work only on the issue it was directed to, and **MUST** stop and ask its human when the requirements are unclear, rather than guessing.
An agent **MUST NOT** open issues or pull requests in repositories or on topics its human did not direct it to.

## <a id="maintainers"></a>Maintaining and reviewing

### <a id="ai-40"></a>AI-40: Review AI-assisted work as if you wrote it

A maintainer reviewing an AI-assisted pull request **MUST**:

1. read every changed line, not the description;
1. run the change, or confirm the CI run proves it;
1. reproduce at least one piece of the attached evidence;
1. check identifiers against the release or commit ([AI-07](#ai-07));
1. check the module boundaries ([AI-13](#ai-13)) and any new dependency ([AI-12](#ai-12)).

An approval is a statement that you did all five.

### <a id="ai-41"></a>AI-41: Two humans before merge

Review requirements are set in [the governance document](GOVERNANCE.md#review).
In short: once a project has two or more maintainers, an outside contribution needs approval from two maintainers, and a maintainer's own pull request needs approval from another maintainer.

### <a id="ai-42"></a>AI-42: Maintainers use AI too

Maintainers follow this policy when they use AI tools, and disclose their use in the same way.
The automated checks report problems on a maintainer's own pull request as warnings rather than failures, because the maintainer is already accountable for the repository.

### <a id="labels"></a>Process labels

Maintainers use labels to state the one concrete thing a submission needs next.

| Label | What to do |
| --- | --- |
| `needs-disclosure` | Complete the AI disclosure ([AI-01](#ai-01)) and co-author trailers ([AI-02](#ai-02)). |
| `needs-dco` | Sign off every commit. |
| `needs-reproduction` | Provide a reproduction on the production branch with exact steps. |
| `needs-evidence` | Attach the evidence the change requires ([Evidence by type of change](#evidence)). |
| `needs-tests` | Add the missing regression or coverage tests. |
| `needs-human-explanation` | Explain the rationale or a material change yourself ([AI-04](#ai-04), [AI-05](#ai-05)). |
| `needs-scope-approval` | Agree the scope or dependency with a maintainer before continuing. |
| `needs-refactor` | Move code to the correct module or package ([AI-13](#ai-13)). |

Once you have addressed the request you are welcome to reopen the submission, or open a corrected one that links to the original.

## <a id="enforcement"></a>Enforcement

Breaches of this policy are Code of Conduct matters and follow its [enforcement ladder](CODE_OF_CONDUCT.md#enforcement-guidelines).
The aim is to protect maintainers' time, not to punish honest mistakes, so most problems start and end with a label.

| Step | When it applies |
| --- | --- |
| 1. Correction | A process label. The first time a submission is missing disclosure details, evidence, sign-off or a reproduction. |
| 2. Warning | Undisclosed AI use. Reopening or resubmitting without addressing the stated label. A reply to a reviewer that was written by an AI tool. |
| 3. Temporary Ban | Seven days without opening, reopening or commenting on issues or pull requests in the repository, starting when a maintainer posts the notice. A second resubmission without addressing the stated label, or a sustained pattern of low-effort AI submissions. |
| 4. Permanent Ban | Deleting or weakening tests to make a change pass ([AI-11](#ai-11)). Fabricated evidence, logs or testing claims ([AI-06](#ai-06)). An AI tool's sign-off presented as a human certification ([AI-03](#ai-03)). Continuing after a Temporary Ban. |

Enforcement is judged on accountable ownership, agreed scope, evidence, and whether the contributor can explain their own work.

## <a id="licence"></a>Licence consequences

Every contribution is made under the DCO and licensed to this project under the terms in [LICENSE](LICENSE).

If AI use that was not disclosed is found in a contribution **after it has been merged**, the contribution was submitted in breach of these terms.
It is handled as a licence violation, and cured through the process in the [Cooperation Commitment](COOPERATION_COMMITMENT.md):

1. we notify the contributor;
1. the contributor has 30 days from that notice to cure it, by fully disclosing the AI use and adding the missing co-author trailers, or by providing a replacement written without it;
1. if it is not cured, the affected code is removed or rewritten, and the Code of Conduct ladder applies from Warning.

The same process applies when AI-produced material turns out to reproduce code under an incompatible licence.
In both cases the contributor who signed off is responsible.
That the material came from an AI tool is not a defence.

We will always act in good faith and in the best interests of the project and its contributors.
